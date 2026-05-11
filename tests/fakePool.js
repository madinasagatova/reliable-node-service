function createFakePool(seed = []) {
  const incidents = [...seed];
  let nextId = incidents.length + 1;

  return {
    incidents,
    async query(sql, params = []) {
      if (sql.includes("SELECT 1 AS ok")) {
        return [[{ ok: 1 }]];
      }

      if (sql.includes("INSERT INTO incidents")) {
        const [serviceName, severity, status, description] = params;
        const incident = {
          id: nextId,
          service_name: serviceName,
          severity,
          status,
          description,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        nextId += 1;
        incidents.push(incident);
        return [{ insertId: incident.id, affectedRows: 1 }];
      }

      if (sql.includes("SELECT * FROM incidents WHERE id = ?")) {
        const id = Number(params[0]);
        return [incidents.filter((incident) => incident.id === id)];
      }

      if (sql.includes("SELECT * FROM incidents")) {
        return [[...incidents].reverse()];
      }

      if (sql.includes("UPDATE incidents SET")) {
        const id = Number(params[params.length - 1]);
        const incident = incidents.find((item) => item.id === id);

        if (!incident) {
          return [{ affectedRows: 0 }];
        }

        const assignments = sql.match(/SET (.*) WHERE/)[1].split(", ");
        assignments.forEach((assignment, index) => {
          const field = assignment.split(" = ")[0];
          incident[field] = params[index];
        });
        incident.updated_at = new Date().toISOString();

        return [{ affectedRows: 1 }];
      }

      if (sql.includes("DELETE FROM incidents WHERE id = ?")) {
        const id = Number(params[0]);
        const index = incidents.findIndex((incident) => incident.id === id);

        if (index === -1) {
          return [{ affectedRows: 0 }];
        }

        incidents.splice(index, 1);
        return [{ affectedRows: 1 }];
      }

      throw new Error(`Unhandled fake query: ${sql}`);
    }
  };
}

module.exports = createFakePool;
