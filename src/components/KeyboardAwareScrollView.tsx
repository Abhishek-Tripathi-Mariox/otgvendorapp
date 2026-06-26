import React from 'react';
import {
  KeyboardAvoidingView,
  ScrollView,
  type ScrollViewProps,
} from 'react-native';

// Drop-in replacement for a screen's main vertical <ScrollView> that keeps the
// focused input visible above the keyboard. Uses behavior="padding" on both
// platforms: targetSdk 36 enforces edge-to-edge, which makes the manifest's
// windowSoftInputMode="adjustResize" a no-op, so we can't rely on the OS
// resizing the window. Padding mode measures the keyboard from JS events and
// pads the bottom, then the ScrollView scrolls the focused field into view.
// Forwards all ScrollView props.
type Props = ScrollViewProps & {children?: React.ReactNode};

const KeyboardAwareScrollView: React.FC<Props> = ({children, ...props}) => (
  <KeyboardAvoidingView style={{flex: 1}} behavior="padding">
    <ScrollView keyboardShouldPersistTaps="handled" {...props}>
      {children}
    </ScrollView>
  </KeyboardAvoidingView>
);

export default KeyboardAwareScrollView;
