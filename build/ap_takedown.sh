# restore dhcpcd
sudo mv /etc/dhcpcd.conf.orig /etc/dhcpcd.conf
# restore dnsmasq
sudo mv /etc/dnsmasq.conf.orig /etc/dnsmasq.conf
# restor hostapd
sudo mv /etc/default/hostapd.orig /etc/default/hostapd
# restart/load services
sudo systemctl restart dhcpcd
sudo systemctl disable dnsmasq --now
sudo systemctl mask hostapd
sudo systemctl disable hostpad --now
