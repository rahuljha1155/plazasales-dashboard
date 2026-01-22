import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function Breadcrumb({ links, brandColor = "text-primary", }:
  {
    links: Array<{ label: string; isActive?: boolean; href?: string, handleClick?: () => void }>; brandColor?: string;
  }) {


  return (
    <nav className="flex " aria-label="Breadcrumb">
      <ol className="flex items-center gap-0">
        {links.map((link, index) => (
          <li key={index} className="flex  items-center">
            {index !== 0 && (
              <ChevronRight className="h-4 w-4 text-gray-400 mx-2" />
            )}
            {index === 0 ? (
              // First item with Home link
              <div className="flex items-center">
                <Link onClick={link.handleClick} to="/dashboard" className="flex hover:underline items-center">
                  <h2 className="">Home</h2>
                  <ChevronRight className="h-4 w-4 text-gray-400 mx-1" />
                </Link>
                <Link onClick={link.handleClick} to={link.href || "#"}>
                  <span className={`whitespace-nowrap hover:underline cursor-pointer transition-colors duration-200 ${link.isActive
                    ? ` ${brandColor}`
                    : "text-gray-500 hover:text-gray-700  font-medium"
                    }`}>
                    {link.label.split("").length > 30 ? link.label.slice(0, 30) + "..." : link.label}
                  </span>
                </Link>
              </div>
            ) : link.isActive ? (
              // Active item (no link)
              <span
                className={`flex cursor-default items-center gap-1 transition-colors duration-200 ${brandColor}`}
                aria-current="page"
              >
                {link.label.split("").length > 30 ? link.label.slice(0, 30) + "..." : link.label}
              </span>
            ) : (
              // Regular link item
              <Link onClick={link.handleClick} to={link.href || "#"}>
                <span className="whitespace-nowrap hover:underline cursor-pointer text-gray-500 hover:text-gray-700 font-medium transition-colors duration-200">
                  {link.label.split("").length > 30 ? link.label.slice(0, 30) + "..." : link.label}
                </span>
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
