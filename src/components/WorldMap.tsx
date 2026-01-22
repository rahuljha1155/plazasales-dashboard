import React, { useEffect, useState } from "react";
import { MapContainer, GeoJSON, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fetchVisitDataByCountry } from "@/services/trackVisit";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Feature, GeoJsonObject } from "geojson";
import worldGeoJSON from "./world.json";

interface CountryStats {
  country: string;
  count: number;
}

interface CountryData {
  country: string;
  visitors: number;
  percentChange: number;
}

const SiteVisitorsMap = () => {
  const [visitorsData, setVisitorsData] = useState<CountryData[]>([]);
  const [totalVisits, setTotalVisits] = useState(0);
  const [totalCountries, setTotalCountries] = useState(0);

  const getColor = (visitors: number) => {
    if (visitors > 40000) return "#1E40AF";
    if (visitors > 20000) return "#2563EB";
    if (visitors > 10000) return "#60A5FA";
    return "#BFDBFE";
  };

  const countryStyle = (feature?: Feature) => {
    if (!feature || !feature.properties) {
      return {
        fillColor: "#E5E7EB",
        weight: 1,
        color: "#FFFFFF",
        fillOpacity: 0.7,
      };
    }

    const countryName = feature.properties.name as string;
    const countryVisitors = visitorsData.find(
      (item) => item.country === countryName
    );

    return {
      fillColor: countryVisitors
        ? getColor(countryVisitors.visitors)
        : "#E5E7EB",
      weight: 1,
      color: "#FFFFFF",
      fillOpacity: 0.7,
    };
  };

  const onEachCountry = (feature: Feature, layer: L.Layer) => {
    if (feature.properties && feature.properties.name) {
      const countryName = feature.properties.name;
      const country = visitorsData.find((c) => c.country === countryName);
      if (country) {
        layer.bindTooltip(
          `${countryName}: ${country.visitors.toLocaleString()} visitors`,
          {
            sticky: true,
          }
        );
      }
    }
  };

  const fetchData = async () => {
    try {
      const { data } = await fetchVisitDataByCountry();
      setTotalVisits(data.totalVisits);
      setTotalCountries(data.totalCountries);

      const transformedData = data.countries.map((country: CountryStats) => ({
        country: country.country,
        visitors: country.count,
        percentChange: 0,
      }));

      setVisitorsData(transformedData);
    } catch (error) {
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Card className="w-full h-full mt-10 !px-0 !p-0">
      <CardHeader className="flex flex-row items-center justify-between px-0">
        <CardTitle>Global Site Visitors</CardTitle>
        <div className="flex gap-2">
          <Badge variant="secondary" className="rounded-sm text-primary">
            Total Visits: {totalVisits.toLocaleString()}
          </Badge>
          <Badge variant="outline" className="rounded-sm">Countries: {totalCountries}</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col lg:flex-row gap-4 px-0">
        <div className="w-full lg:w-2/3">
          <div className="h-[400px] w-full relative">
            <MapContainer
              center={[20, 0]}
              zoom={3}
              style={{ height: "100%", width: "100%" }}
              className="rounded-sm z-0"
              scrollWheelZoom={false}
            >
              <GeoJSON
                data={worldGeoJSON as GeoJsonObject}
                style={countryStyle as any}
                onEachFeature={onEachCountry}
              />
            </MapContainer>
          </div>
        </div>
        <div className="w-full lg:w-1/3 bg-gradient-to-b from-white/50 to-white/80 rounded-sm overflow-hidden border">
          <Table>
            <TableHeader>
              <TableRow className="bg-white text-zinc-800">
                <TableHead className=" text-zinc-800">Country</TableHead>
                <TableHead className="text-right text-zinc-800">
                  Visitors
                </TableHead>
                <TableHead className="text-right text-zinc-800">
                  Change
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visitorsData.map((country) => (
                <TableRow key={country.country}>
                  <TableCell>{country.country}</TableCell>
                  <TableCell className="text-right">
                    {country.visitors.toLocaleString()}
                  </TableCell>
                  <TableCell
                    className={`text-right ${country.percentChange >= 0
                      ? "text-green-600"
                      : "text-red-600"
                      }`}
                  >
                    {country.percentChange >= 0 ? "+" : ""}
                    {country.percentChange}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default SiteVisitorsMap;
