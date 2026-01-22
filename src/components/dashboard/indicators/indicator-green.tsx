 

type Props = {
  title: string;
};

export default function IndicatorGreen({ title }: Props) {
  return (
    <span className="bg-green-100 text-green-800  dark:bg-green-900 dark:text-green-300  inline-flex items-center  text-xs font-medium px-2.5 py-0.5 rounded-full ">
    <span className="bg-green-500 w-2 h-2 me-1   rounded-full "></span>
    <p className=" capitalize"> {title}</p>
  </span>
  );
}
