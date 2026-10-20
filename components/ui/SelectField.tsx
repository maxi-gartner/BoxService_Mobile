import { useState } from "react";
import { FlatList, Modal, Pressable, Text, View } from "react-native";

export type SelectOption<T extends string> = { value: T; label: string };

/**
 * RN no tiene <select> nativo — esto abre una lista en un modal, mismo
 * rol que el <Select> de la web (catálogo, tipo de service, etc.).
 */
export function SelectField<T extends string>({
  label,
  value,
  options,
  placeholder,
  onChange,
}: {
  label: string;
  value: T | "";
  options: SelectOption<T>[];
  placeholder: string;
  onChange: (value: T) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <View className="gap-1.5">
      <Text className="text-sm text-muted">{label}</Text>
      <Pressable
        onPress={() => setOpen(true)}
        className="rounded-md border border-border bg-surface px-3 py-3"
      >
        <Text className={selected ? "text-light" : "text-muted"}>
          {selected?.label ?? placeholder}
        </Text>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable className="flex-1 justify-end bg-black/60" onPress={() => setOpen(false)}>
          <Pressable className="max-h-[70%] rounded-t-lg border-t border-border bg-surface">
            <View className="border-b border-border p-4">
              <Text className="text-base font-semibold text-light">{label}</Text>
            </View>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => {
                    onChange(item.value);
                    setOpen(false);
                  }}
                  className={`border-b border-border-light px-4 py-3 ${
                    item.value === value ? "bg-accent-dim" : ""
                  }`}
                >
                  <Text className={item.value === value ? "font-semibold text-accent" : "text-light"}>
                    {item.label}
                  </Text>
                </Pressable>
              )}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
