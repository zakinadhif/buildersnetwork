Vagrant.configure("2") do |config|
  config.vm.box = "ubuntu/jammy64"
  config.vm.box_check_update = false

  # Disable default rsync — causes issues on Windows
  config.vm.synced_folder ".", "/vagrant", disabled: true

  {
    "bn-frontend" => "192.168.56.10",
    "bn-api"      => "192.168.56.11",
    "bn-db"       => "192.168.56.12",
  }.each do |name, ip|
    config.vm.define name do |node|
      node.vm.hostname = name
      node.vm.network "private_network", ip: ip
      node.vm.provider "virtualbox" do |vb|
        vb.name   = name
        vb.memory = name == "bn-api" ? 1024 : 512
        vb.cpus   = 1
      end
    end
  end
end
