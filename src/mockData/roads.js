export const roads = [
  {
    id: "r1",
    name: "NH-10",
    from: "Siliguri",
    to: "Gangtok",
    status: "at_risk",
    riskReason: "Landslide-prone stretch after heavy rainfall",
    coordinates: [
      [26.727, 88.393],
      [27.331, 88.612],
    ],
  },
  {
    id: "r2",
    name: "NH-2",
    from: "Guwahati",
    to: "Shillong",
    status: "accessible",
    riskReason: null,
    coordinates: [
      [26.144, 91.736],
      [25.578, 91.893],
    ],
  },
  {
    id: "r3",
    name: "NH-702",
    from: "Imphal",
    to: "Dimapur",
    status: "inaccessible",
    riskReason: "Road blockade due to ethnic conflict zone",
    coordinates: [
      [24.817, 93.936],
      [25.912, 93.727],
    ],
  },
  {
    id: "r4",
    name: "NH-6",
    from: "Aizawl",
    to: "Silchar",
    status: "at_risk",
    riskReason: "Flash flood warning issued",
    coordinates: [
      [23.727, 92.717],
      [24.827, 92.798],
    ],
  },
   {
    id: "r5",
    name: "NH-40",
    from: "Guwahati",
    to: "Agartala",
    status: "accessible",
    riskReason: null,
    coordinates: [
      [26.144, 91.736],  // Guwahati
      [25.750, 93.170],  // Lumding, Assam
      [25.170, 93.020],  // Haflong, Assam
      [24.827, 92.798],  // Silchar, Assam
      [24.328, 92.011],  // Kailashahar, Tripura
      [23.836, 91.279],  // Agartala
    ],
  },
  {
    id: "r6",
    name: "NH-15",
    from: "Kohima",
    to: "Imphal",
    status: "inaccessible",
    riskReason: "Bridge collapse reported near Mao Gate",
    coordinates: [
      [25.671, 94.108],
      [24.817, 93.936],
    ],
  },
];