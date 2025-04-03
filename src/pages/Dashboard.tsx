
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Car, Cars, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCarCollections } from "@/hooks/useCarCollections";
import { CollectionGrid } from "@/components/collection/CollectionGrid";
import { FeaturedCar } from "@/components/car/FeaturedCar";

const Dashboard = () => {
  const navigate = useNavigate();
  const { collections, cars } = useCarCollections();
  
  // Stats cards data
  const statsCards = [
    {
      title: "Total Cars",
      value: cars.length,
      description: "Cars in your inventory",
      icon: <Car className="h-6 w-6 text-accent-blue" />,
      change: "+2 from last month"
    },
    {
      title: "Collections",
      value: collections.length,
      description: "Organized car collections",
      icon: <Cars className="h-6 w-6 text-accent-amber" />,
      change: "No change"
    },
    {
      title: "Value Estimate",
      value: "$2.4M",
      description: "Total collection value",
      icon: <BarChart className="h-6 w-6 text-accent-green" />,
      change: "+$125K from last month"
    },
    {
      title: "Clients",
      value: "3",
      description: "Total client accounts",
      icon: <Users className="h-6 w-6 text-accent-red" />,
      change: "No change"
    }
  ];

  // Get featured car (most recently added for now)
  const featuredCar = cars.length > 0 ? cars[0] : null;
  
  return (
    <div className="space-y-6 p-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your car collection management system.
        </p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat) => (
          <Card key={stat.title} className="stats-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Featured car and recent collections */}
      <div className="grid gap-6 md:grid-cols-2">
        {featuredCar && (
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Featured Car</CardTitle>
            </CardHeader>
            <CardContent>
              <FeaturedCar car={featuredCar} />
            </CardContent>
          </Card>
        )}
        
        <Card className="md:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Collections</CardTitle>
          </CardHeader>
          <CardContent>
            <CollectionGrid 
              collections={collections.slice(0, 2)} 
              className="grid-cols-1"
            />
            <button 
              onClick={() => navigate("/collections")} 
              className="w-full mt-4 text-sm text-accent hover:underline"
            >
              View all collections
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
