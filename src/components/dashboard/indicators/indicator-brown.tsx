 

type Props = {
  title: string;
};

export default function IndicatorBrown({ title }: Props) {
  return (
    <span className="bg-brown-100 text-brown-800  dark:bg-brown-900 dark:text-brown-300  inline-flex items-center  text-xs font-medium px-2.5 py-0.5 rounded-full ">
    <span className="bg-brown-500 w-2 h-2 me-1   rounded-full "></span>
    <p className=" capitalize"> {title}</p>
  </span>
  );
}
