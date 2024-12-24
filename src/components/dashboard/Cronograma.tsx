"use client";

import React, { useState } from "react";
import { Tabs } from "../tabs/Tabs";
import { CalendarioTab } from "../tabs/contentTabs/CalendarioTab";
import { MonthTab } from "../tabs/contentTabs/MonthTab";


const Cronograma: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("calendario");

  return (
    <div>
      {/* Tabs */}
      <Tabs onTabChange={(tab) => setActiveTab(tab)} />

      {/* Dynamic Content */}
      <div className="p-4">
        {activeTab === "calendario"
          ? <CalendarioTab />
          : <MonthTab month={activeTab} />}
      </div>
    </div>
  );
}

export default Cronograma;
