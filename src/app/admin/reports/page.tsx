"use client";

import {
} from "recharts";

export default function ReportsPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-xl font-bold">Reports For Booking And Arrival Status</h1>
      <div className="grid grid-cols-4 gap-4">
        <Card title="Early" amount="9.241" />
        <Card title="On time" amount="1.643"/>
        <Card title="Late" amount="7.468"/>
        <Card title="other Activity" amount="1,8948.09" />
       <Card title="Strange" amount="1.708" />
       <Card title="Fit" amount="1.408" />
       <Card title="off-schedule" amount="0"/>
      </div>
           
    
      <div className="bg-white rounded-2xl p-6 shadow">
        <div className="flex justify-between mb-4">
          <h2 className="font-semibold">Latest Tracking</h2>
          <button className="text-blue-500 text-sm">View All</button>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-500 border-b">
              <th className="p-2 text-left">To/From</th>
              <th className="p-2 text-left">Date</th>
              <th className="p-2 text-left">Description</th>
              <th className="p-2 text-right">Amount</th>
              <th className="p-2 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            <tr className="border-b">
              <td className="p-3">Surya</td>
              <td>16 NOvember</td>
              <td>Monthly Recap</td>
              <td className="text-right text-green-600">+1500</td>
              <td className="text-right">
                <span className="px-3 py-1 rounded-full bg-green-100 text-green-600">
                  Success
                </span>
              </td>
            </tr>

            <tr>
              <td className="p-3">Dream Studio</td>
              <td>29 Sep 2023</td>
              <td>Invoice Payment</td>
              <td className="text-right text-red-600">-320</td>
              <td className="text-right">
                <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-600">
                  Pending
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Card({ title, amount, }: { title: string; amount: string;}) {
  return (
    <div className="bg-white p-4 shadow rounded-xl">
      <p className="text-gray-500 text-sm">{title}</p>
      <h2 className="text-2xl font-bold mt-1">{amount}</h2>
    </div>
  );
}
