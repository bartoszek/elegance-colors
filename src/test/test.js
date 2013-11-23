#!/usr/bin/gjs
const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;
const Gtk = imports.gi.Gtk;
const Lang = imports.lang;
const Signals = imports.signals;

const Storage = new Lang.Class({
	Name: 'Storage',

	_init: function(){
		//directory and files location
		this.directoryPresets = "./../presets";
		this.currentPresetFile = "./../current.ini";

		//Storage Data
		this.presets = [];
		this.readPresetsFromDirectory(this.directoryPresets);
		this.printPresets();
		
		//signals
		Signals.addSignalMethods(this);
		this.connect("UpdateCurrentPresetNumber",  Lang.bind(this, function(){
			//to be added
		}));
				
	},

	readPresetsFromDirectory: function(location){
		try {
			let directory = Gio.File.new_for_path(location);
			let directoryEnum = directory.enumerate_children("standard::*", Gio.FileQueryInfoFlags.NONE, null);
			
			let hasMore = true;
			while (hasMore){
				let presetFileInfo = directoryEnum.next_file(null);
				if (presetFileInfo == null){
					hasMore = false;
				} else {
					let presetPath = directoryEnum.get_container().get_path()+"/"+presetFileInfo.get_name();
					if (presetFileInfo.get_file_type() === Gio.FileType.DIRECTORY){
						let preset = new Preset(presetPath);
						this.presets.push(preset);
					}
				}
			}
		} catch (error){
			print(error);
		}

	},

	printPresets: function(){
		for (let i=0; i<this.presets.length; i++){
			this.presets[i].print();
		}
	}


});

const Preset = new Lang.Class({
	Name: 'Preset',

	_init: function(location){
		//Default
		this.defaultKeyFile = location+"/../default/config.ini"

		//keyfile
		this.keyFilePath = location+"/config.ini";
		this.keyFile = null;
		
		//image
		this.imagePath = location+"/screenshot.png";
		this.image = null;
		
		//state
		this.modified = false;
		this.current = false;

		//load data to preset
		this.readKeyFile();
		this.readImage();
	},

	readKeyFile: function(){
		try {
			this.keyFile = new GLib.KeyFile();
			this.keyFile.load_from_file(this.keyFilePath, GLib.KeyFileFlags.NONE);
		}catch (error){
			print(error+" | path: " + this.keyFilePath +" -> fallback to default KeyFile");
			this.readDefaultKeyFile();
		}
	},

	readImage: function(){
		try {
			this.image = new Gtk.Image();
			this.image.set_from_file(this.imagePath);
		} catch(error){
			print(error+" | path: " + this.imagePath +" -> fallback to default Image");
			//this.readDefaultImage();
		}
	},

	readDefaultKeyFile: function(){
		try {
			this.keyFile = new GLib.KeyFile();
			this.keyFile.load_from_file(this.defaultKeyFile, GLib.KeyFileFlags.NONE);
		}catch (error){
			print(error+" | path: " + this.keyFilePath);
		}
	},

	print: function(){
		print(this.keyFilePath);
		print(this.keyFile);
		print(this.imagePath);
		print(this.image);
		print();
	}

});

var storage = new Storage();