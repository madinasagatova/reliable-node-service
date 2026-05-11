const express = require("express");

const allowedSeverities = new Set(["low", "medium", "high", "critical"]);
const allowedStatuses = new Set(["open", "investigating", "resolved"]);

function badRequest(message) {
  const error = new Error(message);
  error.statusCode = 400;
  error.code = "bad_request";
  return error;
}

function notFound(message) {
  const error = new Error(message);
  error.statusCode = 404;
  error.code = "not_found";
  return error;
}

function validateIncident(body, partial = false) {
  const serviceName = body.service_name;
  const severity = body.severity;
  const status = body.status;
  const description = body.description;

  if (!partial || serviceName !== undefined) {
    if (!serviceName || typeof serviceName !== "string") {
      throw badRequest("service_name is required");
    }
  }

  if (!partial || description !== undefined) {
    if (!description || typeof description !== "string") {
      throw badRequest("description is required");
    }
  }

  if (severity !== undefined && !allowedSeverities.has(severity)) {
    throw badRequest("severity must be one of: low, medium, high, critical");
  }

  if (status !== undefined && !allowedStatuses.has(status)) {
    throw badRequest("status must be one of: open, investigating, resolved");
  }
}

function mapIncident(row) {
  return {
    id: row.id,
    service_name: row.service_name,
    severity: row.severity,
    status: row.status,
    description: row.description,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}

function createIncidentsRouter(pool) {
  const router = express.Router();

  router.get("/", async (req, res, next) => {
    try {
      const { status, severity } = req.query;
      const filters = [];
      const values = [];

      if (status) {
        filters.push("status = ?");
        values.push(status);
      }

      if (severity) {
        filters.push("severity = ?");
        values.push(severity);
      }

      const whereClause = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
      const [rows] = await pool.query(
        `SELECT * FROM incidents ${whereClause} ORDER BY created_at DESC LIMIT 100`,
        values
      );

      res.json({
        data: rows.map(mapIncident)
      });
    } catch (error) {
      next(error);
    }
  });

  router.get("/:id", async (req, res, next) => {
    try {
      const [rows] = await pool.query("SELECT * FROM incidents WHERE id = ?", [req.params.id]);

      if (!rows.length) {
        throw notFound("incident not found");
      }

      res.json({
        data: mapIncident(rows[0])
      });
    } catch (error) {
      next(error);
    }
  });

  router.post("/", async (req, res, next) => {
    try {
      validateIncident(req.body);

      const [result] = await pool.query(
        `INSERT INTO incidents (service_name, severity, status, description)
         VALUES (?, ?, ?, ?)`,
        [
          req.body.service_name,
          req.body.severity || "low",
          req.body.status || "open",
          req.body.description
        ]
      );

      const [rows] = await pool.query("SELECT * FROM incidents WHERE id = ?", [result.insertId]);

      res.status(201).json({
        data: mapIncident(rows[0])
      });
    } catch (error) {
      next(error);
    }
  });

  router.patch("/:id", async (req, res, next) => {
    try {
      validateIncident(req.body, true);

      const fields = [];
      const values = [];

      for (const field of ["service_name", "severity", "status", "description"]) {
        if (req.body[field] !== undefined) {
          fields.push(`${field} = ?`);
          values.push(req.body[field]);
        }
      }

      if (!fields.length) {
        throw badRequest("at least one editable field is required");
      }

      values.push(req.params.id);
      const [result] = await pool.query(
        `UPDATE incidents SET ${fields.join(", ")} WHERE id = ?`,
        values
      );

      if (result.affectedRows === 0) {
        throw notFound("incident not found");
      }

      const [rows] = await pool.query("SELECT * FROM incidents WHERE id = ?", [req.params.id]);

      res.json({
        data: mapIncident(rows[0])
      });
    } catch (error) {
      next(error);
    }
  });

  router.delete("/:id", async (req, res, next) => {
    try {
      const [result] = await pool.query("DELETE FROM incidents WHERE id = ?", [req.params.id]);

      if (result.affectedRows === 0) {
        throw notFound("incident not found");
      }

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  return router;
}

module.exports = createIncidentsRouter;
