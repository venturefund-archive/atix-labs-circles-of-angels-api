trap cleanup EXIT

cleanup() {
  kill $gsn_relay_server_pid
}

ganache_url="http://localhost:8545"
relayer_port=8099

setup_gsn_relay() {
  gsn_relay_server_pid=$(npx oz-gsn run-relayer --ethereumNodeURL $ganache_url --port $relayer_port --detach --quiet)
}