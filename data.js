// data.js - SAMPLE DATA ONLY (no app logic here).
// Used the first time the site opens and when "Reset demo data" is clicked.
// Times are created relative to "now" so the demo always looks fresh.

function buildSampleData() {
  const now = Date.now();
  function ago(hours) { return new Date(now - hours * 3600000).toISOString(); }

  const data = {
    counterOpen: true,

    students: [
      { id: "RU2026CS001", name: "Aarav Sharma", password: "ru@2026", bag: "B-001" },
      { id: "RU2026CS002", name: "Ananya Verma", password: "ru@2026", bag: "B-002" },
      { id: "RU2026CS003", name: "Ishaan Kumar", password: "ru@2026", bag: "B-003" }
    ],

    workers: [
      { id: "W-001", name: "Ramesh Yadav", password: "worker@ru" },
      { id: "W-002", name: "Sunita Devi", password: "worker@ru" }
    ],

    admins: [
      { id: "admin", name: "Dr. Priya Menon", password: "admin@ru" }
    ],

    bags: [],
    transactions: [],
    complaints: [],
    notifications: [],
    activity: []
  };

  // 10 bags: the first three belong to the sample students, the rest are free
  for (let i = 1; i <= 10; i++) {
    const number = "B-" + String(i).padStart(3, "0");
    const owner = data.students.find(function (s) { return s.bag === number; });
    data.bags.push({
      number: number,
      studentId: owner ? owner.id : null,
      status: "Bag not given",
      quantity: null,
      receivedAt: null,
      returnedAt: null,
      collectedAt: null,
      updatedBy: null,
      updatedAt: null
    });
  }

  // Ananya: bag received 20 hours ago -> "Bag in process"
  data.transactions.push({
    id: "TX-SEED-1", type: "give", studentId: "RU2026CS002", bag: "B-002", quantity: 6,
    status: "completed", code: "G-SEED01", createdAt: ago(20.2), expiresAt: ago(20.0),
    completedAt: ago(20), workerId: "W-001", confirmedQuantity: 6, seen: true, giveTxnId: null,
    events: [
      { time: ago(20.2), text: "Give Clothes request created", by: "RU2026CS002" },
      { time: ago(20.2), text: "QR code generated", by: "RU2026CS002" },
      { time: ago(20), text: "Bag received by worker", by: "W-001" }
    ]
  });
  data.bags[1].status = "Bag in process";
  data.bags[1].quantity = 6;
  data.bags[1].receivedAt = ago(20);
  data.bags[1].updatedBy = "W-001";
  data.bags[1].updatedAt = ago(20);

  // Ishaan: bag received 48 hours ago, returned to the counter 2 hours ago -> "Bag at counter"
  data.transactions.push({
    id: "TX-SEED-2", type: "give", studentId: "RU2026CS003", bag: "B-003", quantity: 4,
    status: "completed", code: "G-SEED02", createdAt: ago(48.2), expiresAt: ago(48.0),
    completedAt: ago(48), workerId: "W-002", confirmedQuantity: 4, seen: true, giveTxnId: null,
    events: [
      { time: ago(48.2), text: "Give Clothes request created", by: "RU2026CS003" },
      { time: ago(48.2), text: "QR code generated", by: "RU2026CS003" },
      { time: ago(48), text: "Bag received by worker", by: "W-002" }
    ]
  });
  data.bags[2].status = "Bag at counter";
  data.bags[2].quantity = 4;
  data.bags[2].receivedAt = ago(48);
  data.bags[2].returnedAt = ago(2);
  data.bags[2].updatedBy = "W-002";
  data.bags[2].updatedAt = ago(2);

  data.activity.push(
    { time: ago(2), text: "Bag returned to counter", studentId: "RU2026CS003", bag: "B-003", by: "W-002" },
    { time: ago(20), text: "Bag received by worker", studentId: "RU2026CS002", bag: "B-002", by: "W-001" },
    { time: ago(48), text: "Bag received by worker", studentId: "RU2026CS003", bag: "B-003", by: "W-002" }
  );

  data.notifications.push(
    { id: "N-SEED-1", studentId: "RU2026CS003", text: "Your clothes are ready for collection.", time: ago(2), read: false },
    { id: "N-SEED-2", studentId: "RU2026CS002", text: "Your bag has been received by the laundry worker.", time: ago(20), read: false }
  );

  data.complaints.push({
    id: "C-1001", studentId: "RU2026CS003", bag: "B-003", txnId: "TX-SEED-2",
    category: "Delay in returning clothes",
    description: "My bag was given two days ago and it is still not ready.",
    status: "Under review", createdAt: ago(5), updatedAt: ago(3),
    updates: [
      { time: ago(5), by: "RU2026CS003", text: "Complaint submitted", status: "Open" },
      { time: ago(3), by: "admin", text: "We are checking with the laundry team.", status: "Under review" }
    ]
  });

  return data;
}
