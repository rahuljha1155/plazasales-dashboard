type Props = {
  title: string;
};

export default function IndicatorBlue({ title }: Props) {
  return (
    <span className="bg-orange-100 text-orange-800  dark:bg-orange-900 dark:text-orange-300  inline-flex items-center  text-xs font-medium px-2.5 py-0.5 rounded-full ">
      <span className="bg-primary w-2 h-2 me-1   rounded-full "></span>
      <p className=" capitalize"> {title}</p>
    </span>
  );
}
