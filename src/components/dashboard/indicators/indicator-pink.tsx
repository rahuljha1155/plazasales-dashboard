 

type Props = {
  title: string;
};

export default function IndicatorPink({ title }: Props) {
  return (
    <span className="bg-pink-100 text-pink-800  dark:bg-pink-900 dark:text-pink-300  inline-flex items-center  text-xs font-medium px-2.5 py-0.5 rounded-full ">
    <span className="bg-pink-500 w-2 h-2 me-1   rounded-full "></span>
    <p className=" capitalize"> {title}</p>
  </span>
  );
}
