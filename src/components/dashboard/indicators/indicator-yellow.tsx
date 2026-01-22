 

type Props = {
  title: string;
};

export default function IndicatorYellow({ title }: Props) {
  return (
    <span className="bg-yellow-100 text-yellow-800  dark:bg-yellow-900 dark:text-yellow-300  inline-flex items-center  text-xs font-medium px-2.5 py-0.5 rounded-full ">
    <span className="bg-yellow-500 w-2 h-2 me-1   rounded-full "></span>
    <p className=" capitalize"> {title}</p>
  </span>
  );
}
