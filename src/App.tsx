import clsx from "clsx";
import { match } from "ts-pattern";
import { RxMagnifyingGlass } from "react-icons/rx";
import { RxCheck } from "react-icons/rx";
import { RxCross2 } from "react-icons/rx";
import { Task as TaskComponent, mapStringToVariant } from "./components/Task";
import useAppIndex from "./App.hook";
import { TaskStatus } from "./App.types";

function App() {
  const {
    formCreate,
    formSearch,
    displayedTasks,
    activeSearchQuery,
    parentTaskIdForCreate,
    isProMode,
    handleCreateTask,
    handleDeleteTask,
    handleResetSearch,
    handleSearchTask,
    handleToggleTask,
    handleUpdateTask,
    onCancelCreateSubTask,
    onCreateSubTask,
    toggleTriggerUpdateTask,
    handleProModeChange,
  } = useAppIndex();

  return (
    <main className={clsx("container mx-auto space-y-16 py-20 px-8 lg:px-64")}>
      <header className="space-y-2">
        <h1 className="text-5xl text-center">Todo.dev</h1>

        <form className="flex justify-center">
          <label className="cursor-pointer label flex gap-2 items-center">
            <span className="label-text">Pro Mode</span>
            <input
              type="checkbox"
              className="toggle toggle-primary"
              checked={isProMode}
              onChange={handleProModeChange}
            />
          </label>
        </form>
      </header>

      <dialog id="greetModal" className="modal">
        <div className="modal-box">
          <p className="font-bold text-lg">Todo.dev</p>
          <p className="py-4">
            Welcome to todo.dev. This app forces you to only use keyboard for
            managing tasks! Disable this behaviour by clicking the "Pro Mode"
            radio button
          </p>
          <div className="modal-action">
            <form method="dialog">
              <button className="btn">Got It</button>
            </form>
          </div>
        </div>
      </dialog>

      <div
        className={clsx("space-y-8 relative", {
          "cursor-not-allowed": isProMode,
        })}
      >
        {isProMode && (
          <div className="absolute inset-0 cursor-not-allowed z-10"></div>
        )}
        <form
          onSubmit={formCreate.handleSubmit((v) =>
            handleCreateTask(v.newTitle)
          )}
          className="flex flex-col items-center"
        >
          <label
            htmlFor="newTitle"
            className="group input input-bordered flex items-center gap-2 transition-all hover:border-primary focus-within:border-primary"
          >
            <input
              id="newTitle"
              type="text"
              className="grow"
              placeholder="Create New Task"
              {...formCreate.register("newTitle", {
                required: true,
                onBlur: () => {
                  formCreate.reset();
                },
              })}
            />
            <button
              className="opacity-0 group-focus-within:opacity-100 hover:text-primary"
              type="submit"
            >
              <RxCheck />
            </button>
          </label>
        </form>

        <form
          onReset={handleResetSearch}
          onSubmit={formSearch.handleSubmit((v) =>
            handleSearchTask(v.searchQuery)
          )}
        >
          <label
            htmlFor="newTitle"
            className="group input input-bordered flex items-center gap-2 transition-all hover:border-primary focus-within:border-primary"
          >
            <input
              id="searchTitle"
              type="text"
              className="grow"
              placeholder="Search Task"
              defaultValue={activeSearchQuery ?? ""}
              {...formSearch.register("searchQuery")}
            />
            {activeSearchQuery && (
              <button
                className={clsx("opacity-0 hover:text-primary", {
                  "group-focus-within:opacity-100": activeSearchQuery,
                })}
                type="reset"
              >
                <RxCross2 />
              </button>
            )}
            <button
              className="opacity-0 group-focus-within:opacity-100 hover:text-primary"
              type="submit"
            >
              <RxMagnifyingGlass />
            </button>
          </label>
        </form>

        <div className="divider"></div>

        {displayedTasks.length > 0 && (
          <ul className="space-y-4">
            {displayedTasks.map((task) => (
              <li key={task.id}>
                <TaskComponent
                  id={task.id}
                  title={task.title}
                  variant={mapStringToVariant(
                    match(task.status)
                      .with(TaskStatus.DONE, () => "done")
                      .with(TaskStatus.NOT_DONE, () => "notDone")
                      .with(TaskStatus.IN_EDIT, () => "inEdit")
                      .otherwise(() => "notDone")
                  )}
                  onClickToggle={() => handleToggleTask(task.id)}
                  onClickTriggerEdit={() => toggleTriggerUpdateTask(task.id)}
                  onClickCancelEdit={() => toggleTriggerUpdateTask(task.id)}
                  onSubmitEdit={(value) => handleUpdateTask(value, task.id)}
                  onClickDelete={() => handleDeleteTask(task.id)}
                  hasAddBtn
                  onClickAdd={() => onCreateSubTask(task.id)}
                />
                <ul className="ml-10">
                  {task?.subTasks?.map((subTask) => (
                    <li key={subTask.id}>
                      <TaskComponent
                        id={subTask.id}
                        title={subTask.title}
                        variant={mapStringToVariant(
                          match(subTask.status)
                            .with(TaskStatus.DONE, () => "done")
                            .with(TaskStatus.NOT_DONE, () => "notDone")
                            .with(TaskStatus.IN_EDIT, () => "inEdit")
                            .otherwise(() => "notDone")
                        )}
                        onClickTriggerEdit={() =>
                          toggleTriggerUpdateTask(subTask.id, task.id)
                        }
                        onClickCancelEdit={() =>
                          toggleTriggerUpdateTask(subTask.id, task.id)
                        }
                        onSubmitEdit={(value) =>
                          handleUpdateTask(value, subTask.id, task.id)
                        }
                        onClickToggle={() =>
                          handleToggleTask(subTask.id, task.id)
                        }
                        onClickDelete={() =>
                          handleDeleteTask(subTask.id, task.id)
                        }
                      />
                    </li>
                  ))}
                  <li
                    className={clsx({
                      "opacity-0": parentTaskIdForCreate !== task.id,
                      "h-0": parentTaskIdForCreate !== task.id,
                      "w-0": parentTaskIdForCreate !== task.id,
                    })}
                    key={`task-${task.id}-sub-task-form`}
                  >
                    <TaskComponent
                      disableKeyboardTab={parentTaskIdForCreate !== task.id}
                      id={`task-${task.id}-sub-task-form`}
                      variant="inCreate"
                      onSubmitEdit={handleCreateTask}
                      onClickCancelEdit={onCancelCreateSubTask}
                    />
                  </li>
                </ul>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}

export default App;
