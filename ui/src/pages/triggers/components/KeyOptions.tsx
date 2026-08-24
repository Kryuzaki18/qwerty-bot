import { KEY_OPTION_GROUPS, NONE_KEY_OPTION } from "../../../constants/trigger.constant";

function KeyOptions(): React.JSX.Element {
  return (
    <>
      <option value={NONE_KEY_OPTION.value}>{NONE_KEY_OPTION.label}</option>
      {KEY_OPTION_GROUPS.map((group) => (
        <optgroup key={group.label} label={group.label}>
          {group.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </optgroup>
      ))}
    </>
  );
}

export default KeyOptions;
