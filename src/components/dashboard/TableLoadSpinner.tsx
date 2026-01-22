import { Loader } from "lucide-react";

type Props = {};

export default function TableLoadSpinner({}: Props) {
  return (
    <div className=" h-44 flex items-center justify-center  ">
      <Loader
        size={18}
        className=" animate-spin"
      />
    </div>
  );
}
