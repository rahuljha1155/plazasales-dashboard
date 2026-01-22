 

type Props = {
  title: string;
};

export default function IndicatorRed({ title }: Props) {
  return (
    <span className="bg-red-100 text-red-800  dark:bg-red-900 dark:text-red-300  inline-flex items-center  text-xs font-medium px-2.5 py-0.5 rounded-full ">
      <span className="bg-red-500 w-2 h-2 me-1   rounded-full "></span>
      <p className=" capitalize"> {title}</p>
    </span>
  );
}
