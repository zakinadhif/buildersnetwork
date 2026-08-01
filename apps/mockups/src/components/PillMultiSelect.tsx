import { useId } from "react";
import CreatableSelect from "react-select/creatable";
import type { MultiValue } from "react-select";
import { cn } from "@myapp/ui";

type PillOption = {
  value: string;
  label: string;
};

export function PillMultiSelect({
  selected,
  options,
  onChange,
  placeholder,
  ariaLabel,
  allowCustom = true,
}: {
  selected: string[];
  options: string[];
  onChange: (values: string[]) => void;
  placeholder: string;
  ariaLabel: string;
  allowCustom?: boolean;
}) {
  const inputId = useId();
  const allOptions = Array.from(new Set([...selected, ...options])).map((value) => ({
    value,
    label: value,
  }));
  const value = selected.map((item) => ({ value: item, label: item }));

  function handleChange(next: MultiValue<PillOption>) {
    onChange(next.map((option) => option.value));
  }

  return (
    <CreatableSelect<PillOption, true>
      instanceId={inputId}
      inputId={inputId}
      aria-label={ariaLabel}
      isMulti
      isSearchable
      isClearable={false}
      closeMenuOnSelect={false}
      hideSelectedOptions
      options={allOptions}
      value={value}
      onChange={handleChange}
      placeholder={selected.length === 0 ? placeholder : "Cari lagi…"}
      formatCreateLabel={(input) => `Tambah “${input}”`}
      isValidNewOption={(input) =>
        allowCustom
        && input.trim().length > 0
        && !allOptions.some(
          (option) => option.value.toLocaleLowerCase("id") === input.trim().toLocaleLowerCase("id"),
        )
      }
      noOptionsMessage={() => "Tidak ada pilihan lain"}
      unstyled
      classNames={{
        container: () => "font-body text-ui",
        control: ({ isFocused }) =>
          cn(
            "min-h-11 rounded-card border bg-surface transition-colors",
            isFocused ? "border-ink3" : "border-line",
          ),
        valueContainer: () => "gap-1.5 px-2.5 py-2",
        multiValue: () =>
          "items-center rounded-full border border-accent-line bg-accent-tint pl-2.5 text-accent",
        multiValueLabel: () => "py-1 font-body text-caption font-medium",
        multiValueRemove: () =>
          "mx-0.5 rounded-full p-1 text-accent hover:bg-accent-line",
        input: () => "min-w-[110px] text-ink",
        placeholder: () => "text-ink3",
        indicatorsContainer: () => "pr-2 text-ink3",
        dropdownIndicator: () => "p-1",
        menu: () =>
          "z-[60] mt-1 overflow-hidden rounded-card border border-line bg-surface shadow-[0_8px_24px_oklch(0%_0_0_/_10%)]",
        menuList: () => "max-h-48 p-1.5",
        option: ({ isFocused }) =>
          cn(
            "cursor-pointer rounded-card px-2.5 py-2 font-body text-ui text-ink2",
            isFocused ? "bg-accent-tint text-accent" : "bg-transparent",
          ),
        noOptionsMessage: () => "px-2.5 py-2 text-ink3",
      }}
    />
  );
}
