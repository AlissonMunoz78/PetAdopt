import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { SymbolViewProps, SymbolWeight } from "expo-symbols";
import { ComponentProps } from "react";
import { OpaqueColorValue, StyleProp, TextStyle } from "react-native";

type IconMapping = Record<SymbolViewProps["name"], ComponentProps<typeof MaterialIcons>["name"]>;
type IconSymbolName = keyof typeof MAPPING;

const MAPPING = {
  "house.fill":                           "home",
  "building.2.fill":                  "business",
  "paperplane.fill":                      "send",
  "chevron.left.forwardslash.chevron.right": "code",
  "chevron.right":                        "chevron-right",
  "cart.fill":                            "shopping-cart",
  "bag.fill":                             "storefront",
  "message.fill":                         "chat",
  "photo.fill":                           "photo-camera",
  "camera.fill":                          "photo-camera",
  "person.fill":                          "person",
  "envelope.fill":                        "email",
  "lock.fill":                            "lock",
  "location.fill":                        "my-location",
  "map.fill":                             "map",
  xmark:                                  "close",
  plus:                                   "add",
  checkmark:                              "check",
  "checkmark.circle":                     "check-circle",
  "exclamationmark.triangle.fill":        "warning",

  // 🔥 Íconos nuevos que agregamos para tu app:
  "pawprint.fill":                        "pets",
  "heart.fill":                           "favorite",
  "magnifyingglass":                      "search",
  "square.and.pencil":                    "edit",
  "pencil":                               "edit",
  "trash": "delete",

  "trash.fill":                           "delete",
  "info.circle":                          "info",
  "info.circle.fill":                     "info",
  "doc.text":                             "description",
  "heart.text.square":                    "health-and-safety",
  "heart.text.square.fill":               "health-and-safety",
  "checkmark.circle.fill":                "check-circle",
  "xmark.circle.fill":                    "cancel",
  "camera.viewfinder":                    "photo-camera",
} as IconMapping;

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
