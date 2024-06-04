import clsx from "clsx";
import { useForm } from "react-hook-form";
import { RxCheck, RxCross2, RxPencil2, RxPlus, RxTrash } from "react-icons/rx";
import { P, match } from "ts-pattern";
import { Form, Props } from "./Task.model";

export const Task = (props: Props) => {
  const { disableKeyboardTab = false } = props;
  const form = useForm<Form>();

  return (
    <div
      className={clsx(
        "group transition-all border border-neutral rounded px-4 py-2 h-[49px] flex gap-2 items-center",
        {
          "hover:border-primary": props.variant === "notDone",
          "active:border-primary": props.variant === "notDone",
          "focus-within:border-primary": props.variant === "notDone",
          "opacity-40": props.variant === "done",
        }
      )}
    >
      <button
        tabIndex={disableKeyboardTab ? -1 : 0}
        className={clsx(
          "transition-all border w-4 h-4 rounded-full",
          {
            "bg-white": props.variant === "done",
          },
          "hover:bg-primary",
          "focus:bg-primary",
          "active:bg-primary"
        )}
        onClick={props.onClickToggle}
      />

      <form
        onSubmit={form.handleSubmit((v) => props.onSubmitEdit?.(v.newValue))}
        className={clsx("flex gap-2", {
          "opacity-0": props.variant === "done" || props.variant === "notDone",
          "h-0": props.variant === "done" || props.variant === "notDone",
          "w-0": props.variant === "done" || props.variant === "notDone",
        })}
      >
        <label hidden htmlFor={`${props.id}-input`}>
          Title
        </label>
        <input
          tabIndex={match([props.variant, disableKeyboardTab])
            .with([P._, true], () => -1)
            .with([P.union("inCreate", "inEdit"), false], () => 0)
            .otherwise(() => -1)}
          className="input input-sm input-bordered border w-full"
          id={`${props.id}-input`}
          defaultValue={props.title}
          {...form.register("newValue", {
            required: true,
          })}
        />
        <button
          tabIndex={match([props.variant, disableKeyboardTab])
            .with([P._, true], () => -1)
            .with([P.union("inCreate", "inEdit"), false], () => 0)
            .otherwise(() => -1)}
          type="submit"
          className="hover:text-primary"
        >
          <RxCheck />
        </button>
      </form>

      <span
        className={clsx({
          "line-through": props.variant === "done",
          hidden: props.variant === "inEdit" || props.variant === "inCreate",
        })}
      >
        {props.title}
      </span>

      <div
        className={clsx(
          "ml-auto flex items-center gap-2 opacity-0 focus-within:opacity-100",
          {
            "group-hover:opacity-100": props.variant === "notDone",
            "opacity-100":
              props.variant === "inEdit" || props.variant === "inCreate",
          }
        )}
      >
        {props.variant !== "inCreate" && (
          <button
            tabIndex={disableKeyboardTab ? -1 : 0}
            className="hover:text-primary"
            onClick={props.onClickDelete}
          >
            <RxTrash />
          </button>
        )}

        {props.hasAddBtn && (
          <button
            tabIndex={disableKeyboardTab ? -1 : 0}
            className="hover:text-primary"
            onClick={props.onClickAdd}
          >
            <RxPlus />
          </button>
        )}

        {match(props.variant)
          .with(P.union("inEdit", "inCreate"), () => (
            <button
              tabIndex={disableKeyboardTab ? -1 : 0}
              className="hover:text-primary"
              onClick={props.onClickCancelEdit}
            >
              <RxCross2 />
            </button>
          ))
          .otherwise(() => (
            <button
              tabIndex={disableKeyboardTab ? -1 : 0}
              className="hover:text-primary"
              onClick={() => {
                props.onClickTriggerEdit?.();
                form.setFocus("newValue");
              }}
            >
              <RxPencil2 />
            </button>
          ))}
      </div>
    </div>
  );
};
