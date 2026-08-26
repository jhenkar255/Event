"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignGuestToTable = exports.saveSeatingLayout = exports.getSeatingLayout = exports.saveEventDesign = exports.getEventDesign = void 0;
const EventDesign_1 = require("../models/EventDesign");
const SeatingLayout_1 = require("../models/SeatingLayout");
const Guest_1 = require("../models/Guest");
// ==================== 2D DESIGN CANVAS ====================
const getEventDesign = async (req, res) => {
    try {
        const { eventId } = req.params;
        let design = await EventDesign_1.EventDesign.findOne({ eventId });
        if (!design) {
            design = await EventDesign_1.EventDesign.create({
                eventId,
                elements: [
                    { id: 'el-1', type: 'mandap', x: 450, y: 100, width: 300, height: 200, rotation: 0, color: '#C9A227', label: 'Grand Mandap' },
                    { id: 'el-2', type: 'stage', x: 450, y: 350, width: 300, height: 120, rotation: 0, color: '#7A1F2B', label: 'Main Stage' },
                    { id: 'el-3', type: 'entrance', x: 500, y: 650, width: 200, height: 80, rotation: 0, color: '#F4A340', label: 'Royal Arch Entrance' },
                    { id: 'el-4', type: 'rangoli', x: 550, y: 550, width: 100, height: 100, rotation: 0, color: '#FFB800', label: 'Marigold Rangoli' },
                ],
                themeName: 'Royal Cultural Elegance',
            });
        }
        res.json({ success: true, design });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getEventDesign = getEventDesign;
const saveEventDesign = async (req, res) => {
    try {
        const { eventId } = req.params;
        const { elements, canvasWidth, canvasHeight, themeName } = req.body;
        const design = await EventDesign_1.EventDesign.findOneAndUpdate({ eventId }, { elements, canvasWidth, canvasHeight, themeName }, { new: true, upsert: true });
        res.json({ success: true, message: 'Event visual design saved successfully.', design });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.saveEventDesign = saveEventDesign;
// ==================== SEATING LAYOUT & TABLE ASSIGNMENTS ====================
const getSeatingLayout = async (req, res) => {
    try {
        const { eventId } = req.params;
        let layout = await SeatingLayout_1.SeatingLayout.findOne({ eventId });
        if (!layout) {
            layout = await SeatingLayout_1.SeatingLayout.create({
                eventId,
                layoutType: 'Round Tables',
                tables: [
                    { id: 'tbl-1', name: 'Table 1 - VIP Royal', shape: 'round', x: 200, y: 250, capacity: 8, assignedGuests: [] },
                    { id: 'tbl-2', name: 'Table 2 - Bride Family', shape: 'round', x: 200, y: 400, capacity: 8, assignedGuests: [] },
                    { id: 'tbl-3', name: 'Table 3 - Groom Family', shape: 'round', x: 900, y: 250, capacity: 8, assignedGuests: [] },
                    { id: 'tbl-4', name: 'Table 4 - Friends & Colleagues', shape: 'round', x: 900, y: 400, capacity: 8, assignedGuests: [] },
                ],
                totalSeats: 32,
                assignedSeats: 0,
            });
        }
        const guests = await Guest_1.Guest.find({ eventId }).select('_id name relationship rsvpStatus assignedTable');
        res.json({ success: true, layout, guests });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getSeatingLayout = getSeatingLayout;
const saveSeatingLayout = async (req, res) => {
    try {
        const { eventId } = req.params;
        const { layoutType, tables } = req.body;
        let totalSeats = 0;
        let assignedSeats = 0;
        if (Array.isArray(tables)) {
            tables.forEach((t) => {
                totalSeats += Number(t.capacity || 0);
                assignedSeats += Array.isArray(t.assignedGuests) ? t.assignedGuests.length : 0;
            });
        }
        const layout = await SeatingLayout_1.SeatingLayout.findOneAndUpdate({ eventId }, { layoutType, tables, totalSeats, assignedSeats }, { new: true, upsert: true });
        res.json({ success: true, message: 'Seating layout updated successfully.', layout });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.saveSeatingLayout = saveSeatingLayout;
const assignGuestToTable = async (req, res) => {
    try {
        const { eventId } = req.params;
        const { tableId, guestId } = req.body;
        const layout = await SeatingLayout_1.SeatingLayout.findOne({ eventId });
        if (!layout) {
            res.status(404).json({ success: false, message: 'Seating layout not found.' });
            return;
        }
        // Remove guest from any other table
        layout.tables.forEach((tbl) => {
            tbl.assignedGuests = tbl.assignedGuests.filter((id) => id !== guestId);
        });
        // Add guest to specified table
        const targetTable = layout.tables.find((t) => t.id === tableId);
        if (targetTable) {
            if (targetTable.assignedGuests.length >= targetTable.capacity) {
                res.status(400).json({ success: false, message: `Table "${targetTable.name}" is already at full capacity.` });
                return;
            }
            targetTable.assignedGuests.push(guestId);
            await Guest_1.Guest.findByIdAndUpdate(guestId, { assignedTable: targetTable.name });
        }
        // Recalculate assigned seats
        layout.assignedSeats = layout.tables.reduce((acc, t) => acc + t.assignedGuests.length, 0);
        await layout.save();
        res.json({ success: true, message: 'Guest seated successfully.', layout });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.assignGuestToTable = assignGuestToTable;
