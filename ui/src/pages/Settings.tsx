import { RotateCcw } from "lucide-react";
import { KEY_OPTIONS } from "../constants/trigger.constant";
import { useTriggerSettingsStore } from "../store/useTriggerSettingsStore";
import DelayOptions from "./triggers/components/DelayOptions";

function Settings(): React.JSX.Element {
  const {
    defaultDelayMs,
    defaultKey,
    defaultKeyDelayMs,
    setDefaultDelayMs,
    setDefaultKey,
    setDefaultKeyDelayMs,
    resetDefaults,
  } = useTriggerSettingsStore();

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              Trigger Defaults
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Applied to new trigger locations after they&apos;re saved.
            </p>
          </div>
          <button
            type="button"
            onClick={resetDefaults}
            className="inline-flex items-center gap-1.5 rounded-md bg-neutral-200 px-2.5 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-300 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </button>
        </div>

        <div className="mt-4 flex flex-wrap items-end gap-4">
          <label className="flex flex-col gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
            Default delay
            <select
              value={defaultDelayMs}
              onChange={(event) => setDefaultDelayMs(Number(event.target.value))}
              className="rounded-md border border-neutral-200 bg-white px-2 py-1.5 text-sm text-neutral-900 outline-none focus:border-emerald-500 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100"
            >
              <DelayOptions />
            </select>
          </label>

          <label className="flex flex-col gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
            Default key
            <select
              value={defaultKey}
              onChange={(event) => setDefaultKey(event.target.value)}
              className="rounded-md border border-neutral-200 bg-white px-2 py-1.5 text-sm text-neutral-900 outline-none focus:border-emerald-500 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100"
            >
              {KEY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
            Default after-key delay
            <select
              value={defaultKey === "" ? "" : defaultKeyDelayMs}
              onChange={(event) => setDefaultKeyDelayMs(Number(event.target.value))}
              disabled={defaultKey === ""}
              className="rounded-md border border-neutral-200 bg-white px-2 py-1.5 text-sm text-neutral-900 outline-none focus:border-emerald-500 disabled:cursor-not-allowed disabled:opacity-40 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100"
            >
              {defaultKey === "" && <option value="">N/A</option>}
              <DelayOptions />
            </select>
          </label>
        </div>
      </section>
    </div>
  );
}

export default Settings;
