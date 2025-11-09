// Controller/salary.controller.js
import { Op } from "sequelize";
import { User, Payroll, Attendance, Company } from "../config/db.js";
import { SalaryStructure, SalaryComponent } from "../config/db.js";

/**
 * List salary structures (company scoped)
 * GET /api/admin/salary-structures?company_id=1
 */
export const listSalaryStructures = async (req, res) => {
    try {
        const company_id = Number(req.query.company_id) || req.user?.company_id;
        if (!company_id) return res.status(400).json({ message: "company_id required" });

        const list = await SalaryStructure.findAll({
            where: { company_id },
            include: [{ model: SalaryComponent }],
            order: [["salary_structure_id", "DESC"]],
        });
        res.json(list);
    } catch (err) {
        console.error("listSalaryStructures error:", err);
        res.status(500).json({ message: "Error fetching salary structures" });
    }
};

/**
 * Create salary structure with optional components
 * POST /api/admin/salary-structures
 */
export const createSalaryStructure = async (req, res) => {
    try {
        const { company_id, name, description, components } = req.body;
        if (!company_id || !name) return res.status(400).json({ message: "company_id and name required" });

        // Optional: check company exists
        const comp = await Company.findByPk(company_id);
        if (!comp) return res.status(404).json({ message: "Company not found" });

        const st = await SalaryStructure.create({ company_id, name, description });

        if (Array.isArray(components) && components.length) {
            const created = [];
            for (const [i, c] of components.entries()) {
                const createdComp = await SalaryComponent.create({
                    salary_structure_id: st.salary_structure_id,
                    name: c.name,
                    type: c.type || "fixed",
                    apply_on: c.apply_on || "WAGE",
                    value: c.value ?? 0,
                    is_deduction: c.is_deduction ? 1 : 0,
                    sequence: c.sequence ?? i,
                });
                created.push(createdComp);
            }
            st.dataValues.SalaryComponents = created;
        }

        res.status(201).json(st);
    } catch (err) {
        console.error("createSalaryStructure error:", err);
        res.status(500).json({ message: "Error creating salary structure" });
    }
};

/**
 * Update salary structure
 * PUT /api/admin/salary-structures/:id
 */
export const updateSalaryStructure = async (req, res) => {
    try {
        const id = req.params.id;
        const { name, description } = req.body;
        const st = await SalaryStructure.findByPk(id);
        if (!st) return res.status(404).json({ message: "Salary structure not found" });

        if (name !== undefined) st.name = name;
        if (description !== undefined) st.description = description;
        await st.save();
        res.json(st);
    } catch (err) {
        console.error("updateSalaryStructure error:", err);
        res.status(500).json({ message: "Error updating salary structure" });
    }
};

/**
 * Delete salary structure
 * DELETE /api/admin/salary-structures/:id
 */
export const deleteSalaryStructure = async (req, res) => {
    try {
        const id = req.params.id;
        const deleted = await SalaryStructure.destroy({ where: { salary_structure_id: id } });
        if (!deleted) return res.status(404).json({ message: "Not found or already deleted" });
        res.json({ message: "Deleted" });
    } catch (err) {
        console.error("deleteSalaryStructure error:", err);
        res.status(500).json({ message: "Error deleting salary structure" });
    }
};

/**
 * Create salary component
 * POST /api/admin/salary-components
 */
export const createSalaryComponent = async (req, res) => {
    try {
        const { salary_structure_id, name, type, apply_on, value, is_deduction, sequence } = req.body;
        if (!salary_structure_id || !name) return res.status(400).json({ message: "salary_structure_id and name required" });

        const st = await SalaryStructure.findByPk(salary_structure_id);
        if (!st) return res.status(404).json({ message: "Salary structure not found" });

        const comp = await SalaryComponent.create({
            salary_structure_id,
            name,
            type: type || "fixed",
            apply_on: apply_on || "WAGE",
            value: value ?? 0,
            is_deduction: is_deduction ? 1 : 0,
            sequence: sequence ?? 0,
        });

        res.status(201).json(comp);
    } catch (err) {
        console.error("createSalaryComponent error:", err);
        res.status(500).json({ message: "Error creating salary component" });
    }
};

/**
 * Update salary component
 * PUT /api/admin/salary-components/:id
 */
export const updateSalaryComponent = async (req, res) => {
    try {
        const id = req.params.id;
        const comp = await SalaryComponent.findByPk(id);
        if (!comp) return res.status(404).json({ message: "Component not found" });

        const { name, type, apply_on, value, is_deduction, sequence } = req.body;
        if (name !== undefined) comp.name = name;
        if (type !== undefined) comp.type = type;
        if (apply_on !== undefined) comp.apply_on = apply_on;
        if (value !== undefined) comp.value = value;
        if (is_deduction !== undefined) comp.is_deduction = is_deduction;
        if (sequence !== undefined) comp.sequence = sequence;

        await comp.save();
        res.json(comp);
    } catch (err) {
        console.error("updateSalaryComponent error:", err);
        res.status(500).json({ message: "Error updating component" });
    }
};

/**
 * Delete salary component
 * DELETE /api/admin/salary-components/:id
 */
export const deleteSalaryComponent = async (req, res) => {
    try {
        const id = req.params.id;
        const deleted = await SalaryComponent.destroy({ where: { salary_component_id: id } });
        if (!deleted) return res.status(404).json({ message: "Not found or already deleted" });
        res.json({ message: "Deleted" });
    } catch (err) {
        console.error("deleteSalaryComponent error:", err);
        res.status(500).json({ message: "Error deleting component" });
    }
};

/**
 * Compute payslip for a user for a month using user's assigned salary_structure (company scoped)
 * POST /api/admin/payslip/compute
 * body: { user_id, month: "YYYY-MM", save: true|false }
 */
export const computePayslip = async (req, res) => {
    try {
        const { user_id, month, save } = req.body;
        if (!user_id || !month) return res.status(400).json({ message: "user_id and month required" });

        // load user
        const user = await User.findByPk(user_id);
        if (!user) return res.status(404).json({ message: "User not found" });

        // Load the salary structure for the user's company
        const stId = user.salary_structure_id;
        if (!stId) return res.status(400).json({ message: "User has no salary structure assigned" });

        const structure = await SalaryStructure.findOne({
            where: { salary_structure_id: stId, company_id: user.company_id },
            include: [{ model: SalaryComponent }],
        });
        if (!structure) return res.status(400).json({ message: "Salary structure not found for user's company" });

        const components = (structure.SalaryComponents || []).sort(
            (a, b) => (a.sequence || 0) - (b.sequence || 0)
        );

        // determine wage (prefer user's monthly_wage, else 0)
        const wage = Number(user.monthly_wage || 0);

        // compute basic (component named Basic, else fallback 0)
        const basicComp = components.find((c) => (c.name || "").toLowerCase().includes("basic"));
        let basic = 0;
        if (basicComp) {
            if (basicComp.type === "fixed") basic = Number(basicComp.value);
            else basic = Number((wage * (Number(basicComp.value) / 100)).toFixed(2));
        }

        // compute attendance proration
        const [yearStr, monStr] = (month || "").split("-");
        const year = Number(yearStr),
            mon = Number(monStr);
        const start = new Date(year, mon - 1, 1);
        const end = new Date(year, mon, 0);
        const totalDays = end.getDate();

        // compute working days by excluding weekends (simple rule)
        let workingDays = 0;
        for (let d = 1; d <= totalDays; d++) {
            const dt = new Date(year, mon - 1, d);
            const dow = dt.getDay();
            if (dow !== 0 && dow !== 6) workingDays++;
        }

        // fetch attendance records for that month
        const attRows = await Attendance.findAll({
            where: {
                user_id: user_id,
                date: { [Op.between]: [start.toISOString().slice(0, 10), end.toISOString().slice(0, 10)] },
            },
        });
        let present = 0,
            leave = 0,
            absent = 0
        workingDays;
        attRows.forEach((a) => {
            if (a.status === "Present") present++;
            else if (a.status === "Leave") leave++;
            else absent++;
        });
        const paidDays = present + leave;
        const proration = workingDays ? paidDays / workingDays : 1;

        // If admin configured working days per week, derive count from it
        if (user.working_days_per_week && user.working_days_per_week > 0 && user.working_days_per_week <= 6) {
            // approximate working days in month = (weeks * days/week) + remainder-days
            const totalDays = end.getDate();
            const weeks = Math.floor(totalDays / 7);
            const remainder = totalDays % 7;
            workingDays = weeks * user.working_days_per_week + Math.min(remainder, user.working_days_per_week);
        } else {
            // default: Mon–Fri only
            workingDays = 0;
            for (let d = 1; d <= end.getDate(); d++) {
                const dow = new Date(year, mon - 1, d).getDay();
                if (dow !== 0 && dow !== 6) workingDays++;
            }
        }

        // compute components (with guaranteed Basic inclusion)
        const grossComponents = [];
        const deductionComponents = [];
        let gross = 0,
            totalDeductions = 0;


        // ✅ Always include Basic in gross (prorated), even if not defined as component
        if (basic > 0) {
            const basicRow = {
                name: "Basic Salary",
                amount: Number((basic * proration).toFixed(2)),
            };
            grossComponents.push(basicRow);
            gross += basicRow.amount;
        }

        // Add other components; skip “basic” to avoid double-count
        for (const c of components) {
            const isBasicName = (c.name || "").toLowerCase().includes("basic");
            if (isBasicName) continue;

            let amount = 0;
            if (c.type === "fixed") amount = Number(c.value);
            else {
                if (c.apply_on === "WAGE") amount = Number((wage * (Number(c.value) / 100)).toFixed(2));
                else if (c.apply_on === "BASIC") amount = Number((basic * (Number(c.value) / 100)).toFixed(2));
                else amount = Number((wage * (Number(c.value) / 100)).toFixed(2));
            }

            const prorated = Number((amount * proration).toFixed(2));
            if (c.is_deduction) {
                deductionComponents.push({ name: c.name, amount: prorated });
                totalDeductions += prorated;
            } else {
                grossComponents.push({ name: c.name, amount: prorated });
                gross += prorated;
            }
        }

        const net = Number((gross - totalDeductions).toFixed(2));

        const breakdown = {
            wage, // Employer cost for UI
            basic,
            workingDays,
            present,
            leave,
            paidDays,
            proration,
            grossComponents,
            deductionComponents,
            gross,
            totalDeductions,
            net,
            month,
            computedAt: new Date(),
        };



        if (save) {
            // prevent duplicates for same user+month
            const existing = await Payroll.findOne({ where: { user_id, month } });
            if (existing) {
                existing.basic_salary = basic;
                existing.pf = deductionComponents.find((d) => /pf/i.test(d.name))?.amount || 0;
                existing.tax = deductionComponents.find((d) => /tax/i.test(d.name))?.amount || 0;
                existing.deductions = totalDeductions;
                existing.net_pay = net;
                existing.payrun_date = new Date();
                existing.breakdown = JSON.stringify(breakdown);
                await existing.save();

                const payrollJson = existing.toJSON();
                payrollJson.breakdown = payrollJson.breakdown ? JSON.parse(payrollJson.breakdown) : null;
                return res.json({ message: "Payroll updated", payroll: payrollJson, breakdown });
            } else {
                const created = await Payroll.create({
                    user_id,
                    month,
                    basic_salary: basic,
                    pf: deductionComponents.find((d) => /pf/i.test(d.name))?.amount || 0,
                    tax: deductionComponents.find((d) => /tax/i.test(d.name))?.amount || 0,
                    deductions: totalDeductions,
                    net_pay: net,
                    payrun_date: new Date(),
                    breakdown: JSON.stringify(breakdown),
                });
                const payrollJson = created.toJSON();
                payrollJson.breakdown = payrollJson.breakdown ? JSON.parse(payrollJson.breakdown) : null;
                return res.status(201).json({ message: "Payroll created", payroll: payrollJson, breakdown });
            }
        }

        // don't save, just return breakdown
        return res.json({ breakdown });
    } catch (err) {
        console.error("computePayslip error:", err);
        res.status(500).json({ message: "Error computing payslip", error: err.message });
    }
};
