# backup and replace dhcpcd
sudo mv /etc/dhcpcd.conf /etc/dhcpcd.conf.orig
sudo mv dhcpcd.ap.conf /etc/dhcpcd.conf
# backup and replace dnsmasq
sudo mv /etc/dnsmasq.conf /etc/dnsmasq.conf.orig
sudo mv dnsmasq.ap.conf /etc/dnsmasq.conf
# modify hostapd file
sudo cp /etc/default/hostapd /etc/default/hostapd.orig
sudo sed -i "s/#DAEMON_CONF.*/DAEMON_CONF=\"\/etc\/hostapd\/hostapd.conf\"/" /etc/default/hostapd
# restart/load services
sudo systemctl restart dhcpcd
sudo systemctl enable dnsmasq --now
sudo systemctl unmask hostapd
sudo systemctl enable hostpad --now
