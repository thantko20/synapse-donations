import { useFieldContext } from "@/lib/tanstack-form";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { ReactNode } from "react";

export type TextFieldProps = {
  label: ReactNode;
} & Partial<Pick<HTMLInputElement, "type" | "placeholder">>;

export function TextField({ label, type, placeholder }: TextFieldProps) {
  const field = useFieldContext<string>();
  return (
    <div className="space-y-2">
      <Label htmlFor={field.name}>{label}</Label>
      <Input
        id={field.name}
        name={field.name}
        type={type}
        placeholder={placeholder}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        required
      />
      {!field.state.meta.isValid ? (
        <p className="text-destructive text-xs">
          {field.state.meta.errors[0]?.message}
        </p>
      ) : null}
    </div>
  );
}
