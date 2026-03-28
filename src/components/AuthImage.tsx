import React, { useEffect, useState } from 'react';
import { View, Image, TouchableOpacity, StyleSheet, ImageStyle } from 'react-native';
import { getImageSource, ImageSource } from '@src/utils/imageUtils';
import { useTheme } from '@src/contexts/ThemeContext';

interface AuthImageProps {
  url: string;
  style?: ImageStyle;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
  onPress?: () => void;
}

/**
 * Image component that loads authenticated URLs (e.g. /uploads/*) with Bearer token.
 */
const AuthImage = ({ url, style, resizeMode = 'cover', onPress }: AuthImageProps) => {
  const { colors } = useTheme();
  const [source, setSource] = useState<ImageSource | null>(null);

  useEffect(() => {
    if (url) {
      getImageSource(url).then(setSource);
    } else {
      setSource(null);
    }
  }, [url]);

  if (!source) {
    return (
      <View style={[style, styles.placeholder, { backgroundColor: colors.surfaceVariant }]} />
    );
  }

  const image = (
    <Image source={source} style={style} resizeMode={resizeMode} />
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
        {image}
      </TouchableOpacity>
    );
  }

  return image;
};

const styles = StyleSheet.create({
  placeholder: {
    minHeight: 48,
  },
});

export default React.memo(AuthImage);
