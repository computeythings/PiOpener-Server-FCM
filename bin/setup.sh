#!/bin/bash
if [[ $EUID == 0 ]]; then
   echo "This script should not be run as root to allow package installation."
   exit 1
fi

SCRIPT_DIR=$(dirname $BASH_SOURCE)
# Get and store pin locations
NUMBER='^[0-9]+$' # regex to recognize if value is an int
echo "Which pin is the relay control connected to?"
read RELAY_PIN
while ! [[ $RELAY_PIN =~ $NUMBER ]]; do
  echo "The value must be a number"
  read RELAY_PIN
done
echo "Which pin is the open switch connected to?"
read OPEN_SWITCH_PIN
while ! [[ $OPEN_SWITCH_PIN =~ $NUMBER ]]; do
  echo "The value must be a number"
  read OPEN_SWITCH_PIN
done
echo "Which pin is the closed switch connected to?"
read CLOSED_SWITCH_PIN
while ! [[ $CLOSED_SWITCH_PIN =~ $NUMBER ]]; do
  echo "The value must be a number"
  read CLOSED_SWITCH_PIN
done

echo "Installing dependencies"
sudo apt-get update -y
sudo apt-get upgrade -y
sudo apt-get install -y pigpio build-essential
# ARMv6 architecture requires build from grpc due to bugs with firestore module
ARCHITECTURE=$(cat /proc/cpuinfo | grep "model name" | awk -F': ' '{print $2}' | cut -c1-5)
if [ "${ARCHITECTURE,,}" == "armv6" ]; then
  echo "Downloading latest nodejs version"
  NODE="$(curl -sL https://nodejs.org/dist/latest | grep 'armv6l.tar.gz' | cut -d'"' -f2)"
  wget https://nodejs.org/dist/latest/$NODE
  tar -xzf $NODE
  rm $NODE
  echo "Creating nodejs directory in /opt"
  sudo mv $NODE /opt/nodejs
  echo "Symlinking..."
  sudo ln -s /opt/nodejs/bin/node /usr/bin/node
  sudo ln -s /opt/nodejs/bin/npm /usr/bin/npm
  echo "Building node modules"
  npm i --build-from-source grpc
else
  echo "Installing latest nodejs version"
  curl -sL https://deb.nodesource.com/setup_11.x | sudo -E bash -
  sudo apt-get install -y nodejs
  npm i
fi

echo "Creating API Key"
ALPHANUM=0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ
APIKEY=""
for ((i=0 ; i < 26 ; i++))
do
  APIKEY+=${ALPHANUM:$(($RANDOM%62)):1}
done
echo "New API Key generated!"
echo -e "\n\n$APIKEY\n\n"
echo "Make sure to save it somewhere safe"

# Write config to file using saved variables
cat <<EOF > $SCRIPT_DIR/src/config.json
{
  "ACCESS_TOKEN": "$APIKEY",
  "RELAY_PIN": $RELAY_PIN,
  "OPEN_SWITCH_PIN": $OPEN_SWITCH_PIN,
  "CLOSED_SWITCH_PIN": $CLOSED_SWITCH_PIN
}
EOF
echo "Finished creating config."

#TODO: ssl cert generation, systemd service init
# Certbot renewal:                                                                            |===================| -> necessary to make -http-01-port work
#certbot certonly --standalone --preferred-challenges http-01 --http-01-port <Listening Port> --tls-sni-01-port 443 -d <HOSTNAME.COM> --dry-run
