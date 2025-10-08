# Neo4j

## Neo4j Setup and Configuration

### Getting Started with Neo4j
https://neo4j.com/docs/getting-started/whats-neo4j/

### Neo4j Browser
To access the Neo4j Browser, navigate to: [http://localhost:7474/browser/](http://localhost:7474/browser/)


### Cypher Manual
https://neo4j.com/docs/getting-started/cypher-intro/resources/

### JavaScript Driver Manual
https://neo4j.com/docs/javascript-manual/current/

### Neo4j Multiple database in community edition
https://github.com/neo4j/neo4j/issues/12920
https://dozerdb.org

### Configuration
Uncomment this in neo4j.conf:
```
server.default_listen_address=0.0.0.0
auth.basic("neo4j", "12345678")
```

## Management

- to change password using UI run: `:server change-password`

### Neo4j Session Management
Proper session management is crucial in database operations to prevent resource leaks. The session is closed in a finally block to ensure it is always closed, even if an error occurs.

### Neo4j Import
https://neo4j.com/docs/operations-manual/current/tools/neo4j-admin/neo4j-admin-import/