import { match } from "ts-pattern";

export type Form = { newValue: string };

export type Props = {
  variant: Variant;
  className?: string;
  title?: string;
  hasAddBtn?: boolean;
  onClickToggle?: () => void;
  onSubmitEdit?: (updatedTitle: string) => void;
  onClickDelete?: () => void;
  onClickTriggerEdit?: () => void;
  onClickCancelEdit?: () => void;
  onClickAdd?: () => void;
};

type Variant = "done" | "notDone" | "inEdit" | "inCreate";

export const mapStringToVariant = (str: string): Variant => {
  return match(str)
    .with("done", () => "done")
    .with("notDone", () => "notDone")
    .with("inEdit", () => "inEdit")
    .otherwise(() => "notDone") as Variant;
};
