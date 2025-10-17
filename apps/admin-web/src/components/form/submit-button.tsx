import { useFormContext } from "@/lib/tanstack-form";
import { Button } from "@repo/ui/components/button";

export type SubmitButtonProps = {
  children: React.ReactNode;
};

export function SubmitButton({ children }: SubmitButtonProps) {
  const form = useFormContext();
  return (
    <form.Subscribe
      selector={(state) => state.isSubmitting}
      children={(isSubmitting) => {
        return (
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Loading..." : children}
          </Button>
        );
      }}
    />
  );
}
