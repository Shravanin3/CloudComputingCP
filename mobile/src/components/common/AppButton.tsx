import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { colors } from '../../constants/colors';

interface AppButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline' | 'subtle';
  size?: 'sm' | 'md' | 'lg';
}

export const AppButton = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  style,
  textStyle,
  variant = 'primary',
  size = 'md',
}: AppButtonProps) => {
  const getContainerStyle = () => {
    switch (variant) {
      case 'secondary':
        return styles.secondaryBtn;
      case 'danger':
        return styles.dangerBtn;
      case 'success':
        return styles.successBtn;
      case 'outline':
        return styles.outlineBtn;
      case 'subtle':
        return styles.subtleBtn;
      default:
        return styles.primaryBtn;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'outline':
        return styles.outlineText;
      case 'subtle':
        return styles.subtleText;
      default:
        return styles.whiteText;
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'sm':
        return styles.smBtn;
      case 'lg':
        return styles.lgBtn;
      default:
        return styles.mdBtn;
    }
  };

  const getTextSizeStyle = () => {
    switch (size) {
      case 'sm':
        return styles.smText;
      case 'lg':
        return styles.lgText;
      default:
        return styles.mdText;
    }
  };

  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.base,
        getContainerStyle(),
        getSizeStyle(),
        isDisabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'subtle' ? colors.primary : '#FFFFFF'}
        />
      ) : (
        <Text style={[styles.textBase, getTextStyle(), getTextSizeStyle(), textStyle]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  primaryBtn: {
    backgroundColor: colors.primary,
  },
  secondaryBtn: {
    backgroundColor: colors.secondary,
  },
  dangerBtn: {
    backgroundColor: colors.danger,
  },
  successBtn: {
    backgroundColor: colors.success,
  },
  outlineBtn: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  subtleBtn: {
    backgroundColor: colors.primaryLight,
  },
  disabled: {
    opacity: 0.55,
  },

  // Sizes
  smBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  mdBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  lgBtn: {
    paddingVertical: 16,
    paddingHorizontal: 24,
  },

  // Text
  textBase: {
    fontWeight: '600',
    textAlign: 'center',
  },
  whiteText: {
    color: colors.textWhite,
  },
  outlineText: {
    color: colors.textPrimary,
  },
  subtleText: {
    color: colors.primary,
  },
  smText: {
    fontSize: 13,
  },
  mdText: {
    fontSize: 15,
  },
  lgText: {
    fontSize: 17,
    fontWeight: '700',
  },
});