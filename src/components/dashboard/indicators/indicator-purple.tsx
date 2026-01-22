 

type Props = {
  title: string;
};

export default function IndicatorPurple({ title }: Props) {
  return (
    <span className="bg-purple-100 text-purple-800  dark:bg-purple-900 dark:text-purple-300  inline-flex items-center  text-xs font-medium px-2.5 py-0.5 rounded-full ">
    <span className="bg-purple-500 w-2 h-2 me-1   rounded-full "></span>
    <p className=" capitalize"> {title}</p>
  </span>
  );
}
