import { match } from "ts-pattern";

export type Form = { newValue: string };

export type Props = {
  className?: string;
  variant: Variant;
  title?: string;
  onClickToggle?: () => void;
  onSubmitEdit?: (updatedTitle: string) => void;
  onClickDelete?: () => void;
  onClickTriggerEdit?: () => void;
  onClickCancelEdit?: () => void;
};

type Variant = "done" | "notDone" | "inEdit";

export const mapStringToVariant = (str: string): Variant => {
  return match(str)
    .with("done", () => "done")
    .with("notDone", () => "notDone")
    .with("inEdit", () => "inEdit")
    .otherwise(() => "notDone") as Variant;
};
