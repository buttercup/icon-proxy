#!/bin/bash

WORKER_PID=''

handle_sig_term(){
    kill -TERM $WORKER_PID
    wait $WORKER_PID
}

trap 'handle_sig_term' TERM INT

npm start & WORKER_PID=$!

wait $WORKER_PID
