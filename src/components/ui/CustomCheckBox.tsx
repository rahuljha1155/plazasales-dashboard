const Formcheckbox = ({
  addToHome,
  handleFormChange,
  labelCkeckbox,
  checkboxName,
}: any) => {
  return (
    <div className="flex items-center space-x-2">
      <input
        type="checkbox"
        name={checkboxName}
        checked={addToHome}
        onChange={handleFormChange}
        className="h-4 w-4 rounded border-gray-300 text-black"
      />
      <label className="text-sm font-medium text-gray-700">
        {labelCkeckbox}
      </label>
    </div>
  );
};

export default Formcheckbox;
