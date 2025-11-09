// routes/salary.routes.js
import express from "express";
import {
    listSalaryStructures,
    createSalaryStructure,
    updateSalaryStructure,
    deleteSalaryStructure,
    createSalaryComponent,
    updateSalaryComponent,
    deleteSalaryComponent,
    computePayslip
} from "../Controller/salary.controller.js";

import { userAuth } from "../middleware/user.middleware.js";




// Optional adminOnly middleware (if you already have one, import that instead)
import { adminOnly } from "../middleware/admin.middleware.js"; // if exists

const router = express.Router();

// quick ping to verify router mount (no auth)
router.get("/ping", (req, res) => res.json({ ok: true, route: "/api/admin/*" }));

// Protect admin salary routes
// if you want only admin access, keep both userAuth and adminOnly
router.use(userAuth);
// If you don't have adminOnly file, comment next line and see the adminOnly snippet below.
router.use(adminOnly);

// Salary structures CRUD
router.get("/salary-structures", listSalaryStructures);
router.post("/salary-structures", createSalaryStructure);
router.put("/salary-structures/:id", updateSalaryStructure);
router.delete("/salary-structures/:id", deleteSalaryStructure);

// Salary components CRUD
router.post("/salary-components", createSalaryComponent);
router.put("/salary-components/:id", updateSalaryComponent);
router.delete("/salary-components/:id", deleteSalaryComponent);

// Compute payslip
router.post("/payslip/compute", computePayslip);

export default router;