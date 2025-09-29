// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolViewProps, SymbolWeight } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<SymbolViewProps['name'], ComponentProps<typeof MaterialIcons>['name']>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'book.fill': 'book',
  'creditcard.fill': 'credit-card',
  'bell.fill': 'notifications',
  'person.fill': 'person',
  'exclamationmark.triangle': 'warning',
  'arrow.clockwise': 'refresh',
  'edit': 'edit',
  'close': 'close',
  'check': 'check',
  'checkmark': 'check',
  'family': 'family-restroom',
  'lock.shield': 'security',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'speedometer': 'speed',
  'graduationcap': 'school',
  'creditcard': 'credit-card',
  'person': 'person',
  'location': 'location-on',
  'family': 'family-restroom',
  'edit': 'edit',
  'close': 'close',
  'xmark': 'close',
  'checkmark': 'check',
  'arrow.right.square': 'logout',
  'gearshape': 'settings',
  'chart.bar': 'analytics',
  'doc.text': 'description',
  'questionmark.circle': 'help',
  'lock.shield': 'security',
  'pencil': 'edit',
  'xmark': 'close',
  'person.2': 'group',
  'hand.raised': 'privacy-tip',
  'checkmark.circle.fill': 'check-circle',
  'doc.text.fill': 'description',
  'pin.fill': 'push-pin',
  'megaphone.fill': 'campaign',
  'newspaper.fill': 'newspaper',
  'clock.fill': 'schedule',
  'building.2.fill': 'business',
  'person.2.fill': 'group',
  'graduationcap.fill': 'school',
  'calendar': 'event',
  'envelope.fill': 'email',
  'phone.fill': 'phone',
  'dollarsign.circle.fill': 'attach-money',
  'list.bullet': 'format-list-bulleted',
  'banknote.fill': 'money',
  'flask.fill': 'science',
  'arrow.right.square.fill': 'login',
  'eye.fill': 'visibility',
  'eye.slash.fill': 'visibility-off',
} as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
