import { DELAY_OPTIONS } from "../../../constants/trigger.constant";

function DelayOptions(): React.JSX.Element {
  return (
    <>
      {DELAY_OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </>
  );
}

export default DelayOptions;
