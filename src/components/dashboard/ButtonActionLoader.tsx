 import { Loader } from "lucide-react";
 

type Props = {
  size?: number;
};

export default function ButtonActionLoader({ size = 16 }: Props) {
  return (
    <Loader
      size={size}
      className="animate-spin mr-2"
    />
  );
}