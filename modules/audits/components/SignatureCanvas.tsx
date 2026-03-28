import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, PanResponder, Dimensions, Alert } from 'react-native';
import ViewShot from 'react-native-view-shot';
import Svg, { Path } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { Modal, Button } from '@src/components';
import { SPACING, FONT_SIZE, BORDER_RADIUS } from '@src/configs/theme';
import { useTheme } from '@src/contexts/ThemeContext';

interface SignatureCanvasProps {
  visible: boolean;
  onClose: () => void;
  onSave: (imageUriOrDataUrl: string) => void | Promise<void>;
  title: string;
  saving?: boolean;
}

const SignatureCanvas = ({ visible, onClose, onSave, title, saving = false }: SignatureCanvasProps) => {
  const { colors } = useTheme();
  const viewShotRef = useRef<ViewShot>(null);
  const [paths, setPaths] = useState<string[][]>([]);
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [undonePaths, setUndonePaths] = useState<string[][]>([]);
  const [capturing, setCapturing] = useState(false);
  const currentPathRef = useRef<string[]>([]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        const initial = [`M${locationX},${locationY}`];
        setCurrentPath(initial);
        currentPathRef.current = initial;
      },
      onPanResponderMove: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        setCurrentPath((prev) => {
          const next = [...prev, `L${locationX},${locationY}`];
          currentPathRef.current = next;
          return next;
        });
      },
      onPanResponderRelease: () => {
        const pathToAdd = currentPathRef.current;
        if (pathToAdd.length > 0) {
          setPaths((prev) => [...prev, pathToAdd]);
          setUndonePaths([]);
          setCurrentPath([]);
          currentPathRef.current = [];
        }
      },
    })
  ).current;

  const handleClear = () => {
    setPaths([]);
    setCurrentPath([]);
    setUndonePaths([]);
    currentPathRef.current = [];
  };

  const handleUndo = () => {
    if (paths.length === 0) return;
    const lastPath = paths[paths.length - 1];
    setPaths((prev) => prev.slice(0, -1));
    setUndonePaths((prev) => [...prev, lastPath]);
  };

  const handleRedo = () => {
    if (undonePaths.length === 0) return;
    const lastUndone = undonePaths[undonePaths.length - 1];
    setUndonePaths((prev) => prev.slice(0, -1));
    setPaths((prev) => [...prev, lastUndone]);
  };

  const handleSave = async () => {
    const hasPaths = paths.length > 0 || currentPath.length > 0;
    if (!hasPaths) return;

    setCapturing(true);
    try {
      const result = await viewShotRef.current?.capture?.();
      if (result) {
        onSave(result);
        handleClear();
      } else {
        Alert.alert('Hata', 'İmza kaydedilemedi. Lütfen tekrar deneyin.');
      }
    } catch (err) {
      Alert.alert('Hata', 'İmza kaydedilemedi. Lütfen tekrar deneyin.');
    } finally {
      setCapturing(false);
    }
  };

  const screenWidth = Dimensions.get('window').width;
  const canvasWidth = screenWidth * 0.95 - 2 * SPACING.xl;
  const hasPaths = paths.length > 0 || currentPath.length > 0;

  return (
    <Modal visible={visible} onClose={onClose} title={title} size="lg" scrollEnabled={false}>
      <ViewShot
        ref={viewShotRef}
        options={{ format: 'png', result: 'data-uri' }}
        style={[styles.canvas, { width: canvasWidth, height: canvasWidth * 0.5, borderColor: colors.border, backgroundColor: colors.surfaceVariant }]}
      >
        <View style={StyleSheet.absoluteFill} {...panResponder.panHandlers}>
          <Svg width={canvasWidth} height={canvasWidth * 0.5}>
            {paths.map((p, i) => (
              <Path key={i} d={p.join(' ')} stroke={colors.text} strokeWidth={2} fill="none" />
            ))}
            {currentPath.length > 0 && (
              <Path d={currentPath.join(' ')} stroke={colors.text} strokeWidth={2} fill="none" />
            )}
          </Svg>
          {paths.length === 0 && currentPath.length === 0 && (
            <View style={styles.placeholderWrapper} pointerEvents="none">
              <Text style={[styles.placeholder, { color: colors.textTertiary }]}>İmzanızı buraya atın</Text>
            </View>
          )}
        </View>
      </ViewShot>
      <View style={styles.actions}>
        <Button title="Temizle" variant="outline" onPress={handleClear} style={styles.btn} />
        <TouchableOpacity
          onPress={handleUndo}
          disabled={paths.length === 0}
          style={[styles.iconBtn, { borderColor: colors.border }, paths.length === 0 && styles.iconBtnDisabled]}
        >
          <Ionicons name="arrow-undo" size={22} color={paths.length === 0 ? colors.textTertiary : colors.text} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleRedo}
          disabled={undonePaths.length === 0}
          style={[styles.iconBtn, { borderColor: colors.border }, undonePaths.length === 0 && styles.iconBtnDisabled]}
        >
          <Ionicons name="arrow-redo" size={22} color={undonePaths.length === 0 ? colors.textTertiary : colors.text} />
        </TouchableOpacity>
        <Button title="Kaydet" onPress={handleSave} style={styles.btn} disabled={!hasPaths || capturing || saving} loading={capturing || saving} />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  canvas: {
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderWrapper: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    fontSize: FONT_SIZE.md,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  btn: { minWidth: 100 },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnDisabled: {
    opacity: 0.5,
  },
});

export default React.memo(SignatureCanvas);
