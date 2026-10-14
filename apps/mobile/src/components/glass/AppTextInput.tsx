import { forwardRef } from 'react';
import { TextInput, type TextInputProps } from 'react-native';

/**
 * Text field that stays focused after a tap.
 *
 * Android will move focus to the next box when a field re-renders during
 * the tap, when Autofill treats the screen as one form, or when the
 * default underline forces a layout pass. These props block that.
 */
export const AppTextInput = forwardRef<TextInput, TextInputProps>(function AppTextInput(props, ref) {
  return (
    <TextInput
      {...props}
      ref={ref}
      blurOnSubmit={false}
      importantForAutofill="no"
      autoComplete="off"
      textContentType="none"
      underlineColorAndroid="transparent"
    />
  );
});
