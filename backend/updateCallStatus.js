let clients = [];

function updateCallStatus(status) {
  console.log('update call status was called');
  clients.forEach(client => {
    client.res.write(`data: ${JSON.stringify(status)}\n\n`);
  });
}

module.exports = {
  updateCallStatus,
  clients,
};
