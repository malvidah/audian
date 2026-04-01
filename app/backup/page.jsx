"use client";
import dynamic from "next/dynamic";
const Dashboard = dynamic(() => import("../../components/Dashboard"), { ssr: false });
export default function BackupPage() { return <Dashboard />; }
