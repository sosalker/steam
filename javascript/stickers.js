
var g_elActiveSticker = false;
var g_elStickerContainer = null;
var g_rgDragState = false;
var g_nBaseScaleFactor = 1.0;

var CStickerManager = function( elContainer, bEditMode ){
	this.unWidthActual = 940;
	this.fScaleFactor =  this.unWidthActual / 2100; // Sprite scale
	this.elContainer = elContainer;
	this.rgOwnedStickers = [];
	this.bEditMode = bEditMode || false;
	this.rgNewStickersCount = {};

	if( this.bEditMode )
		this.ShowEditHandles();


	this.rgStickerDefinitions = g_rgStickerDefs;

	// Build some maps
	for( var key in this.rgStickerDefinitions )
	{
		this.rgStickerToIdMap.push( key );
		if( this.rgSceneToIdMap.indexOf( this.rgStickerDefinitions[key].texture ) === -1 )
			this.rgSceneToIdMap.push(this.rgStickerDefinitions[key].texture);

	}

	// Make horrible assumptions about filenames
	for( var i=0; i<this.rgSceneToIdMap.length; i++ )
	{

		CStickerManager.prototype.rgStickerTextures[this.rgSceneToIdMap[i]] = 'https://steamcommunity-a.akamaihd.net/public/images/promo/summer2017/stickers/'+this.rgSceneToIdMap[i]+'_sprites.png?v=22';
		CStickerManager.prototype.rgBackgroundTextures[this.rgSceneToIdMap[i]] = 'https://steamcommunity-a.akamaihd.net/public/images/promo/summer2017/stickers/'+this.rgSceneToIdMap[i]+'.jpg?v=22';
	}


	window.addEventListener('resize', this.HandleResize.bind(this));
	this.HandleResize();

}

CStickerManager.prototype.HandleResize = function() {
	// BUCKLE UP
	var fScaleFactor = this.elContainer.parentNode.clientWidth / this.unWidthActual;

	this.elContainer.style.transform = "scale( "+fScaleFactor+", "+fScaleFactor+" )";

	this.fLocalScale = fScaleFactor;

	this.elContainer.style.width = this.unWidthActual + "px";

	var rgBackgrounds = this.elContainer.getElementsByClassName('sticker_background');
	rgBackgrounds[0].style.width = this.unWidthActual + "px";

	// Now do the logo animation

	if ( document.getElementById('logo_anim') )
	{
		document.getElementById('logo_anim').style.transform = "scale( "+fScaleFactor+", "+fScaleFactor+" )";
	}
}

CStickerManager.prototype.rgStickerTextures = {

}

CStickerManager.prototype.rgBackgroundTextures = {

}

CStickerManager.prototype.rgStickerToIdMap = [

];

CStickerManager.prototype.rgSceneToIdMap = [

];

CStickerManager.prototype.rgSceneData = {

};

CStickerManager.prototype.rgStickerDefinitions = {
};


CStickerManager.prototype.RegisterSprites = function(strTexture, strMap, strPlacementMap)
{
	return;
	var rgLines = strMap.split("\n");
	for( var i=0; i<rgLines.length; i++ )
	{
		var rgv = rgLines[i].trim().split(',');
		if( rgv.length != 5 )
			continue;

		this.rgStickerDefinitions[rgv[0]] = {
			texture: strTexture,
			name: rgv[0],
			x: rgv[1],
			y: rgv[2],
			w: rgv[3],
			h: rgv[4]
		}
	}

	var rgLines = strPlacementMap.split("\n");
	for( var i=0; i<rgLines.length; i++ )
	{
		var rgv = rgLines[i].trim().split(',');
		if( rgv.length != 3 && rgv.length != 4 )
			continue;

		this.rgStickerDefinitions[rgv[0]].dx = rgv[1];
		this.rgStickerDefinitions[rgv[0]].dy = rgv[2];
		this.rgStickerDefinitions[rgv[0]].dz = rgv[3] || false;


	}
}

CStickerManager.prototype.AddSticker = function( nStickerId )
{
	// Do we have this sticker in the scene already??
	if( this.BSceneHasSticker( nStickerId ) )
		return;

	var rgData = this.GetSceneData();
	if( rgData.length > 50 )
	{
		ShowAlertDialog("\u0421\u043b\u0438\u0448\u043a\u043e\u043c \u043c\u043d\u043e\u0433\u043e \u043d\u0430\u043a\u043b\u0435\u0435\u043a!", "\u041f\u043e\u0433\u043e\u0434\u0438\u0442\u0435-\u043a\u0430! \u0412\u044b \u043f\u043e\u043f\u044b\u0442\u0430\u043b\u0438\u0441\u044c \u043f\u043e\u043c\u0435\u0441\u0442\u0438\u0442\u044c \u0431\u043e\u043b\u0435\u0435 50 \u043d\u0430\u043a\u043b\u0435\u0435\u043a \u043d\u0430 \u043e\u0434\u043d\u0443 \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u0443. \u0415\u0441\u043b\u0438 \u0445\u043e\u0442\u0438\u0442\u0435 \u0434\u043e\u0431\u0430\u0432\u0438\u0442\u044c \u043d\u043e\u0432\u0443\u044e \u043d\u0430\u043a\u043b\u0435\u0439\u043a\u0443 \u2014 \u0441\u043d\u0430\u0447\u0430\u043b\u0430 \u0443\u0431\u0435\u0440\u0438\u0442\u0435 \u043a\u0430\u043a\u0443\u044e-\u043d\u0438\u0431\u0443\u0434\u044c.");
		return;
	}

	var sticker = this.rgStickerDefinitions[nStickerId];
	if( sticker.texture == this.strScene )
	{
		this.CreateSticker( nStickerId,
			sticker.dx * this.fScaleFactor,
			sticker.dy * this.fScaleFactor,
			1.0,
			1.0,
			0,
			sticker.z
		);
	}
	else
		this.CreateSticker( nStickerId, 10, 10, 1.0, 1.0, 0 );

	if( !this.BSceneUnlocked(this.strScene) && this.BSceneCanBeUnlocked( this.strScene ) )
	{
		this.UnlockScene( this.strScene );
	}
}

//CStickerManager.prototype.Set

CStickerManager.prototype.PopulateStickerList = function()
{
	// Sticker list
	var unMaxWidth = 140; // @todo don't hard code this
	var unMaxHeight = 100; // @todo don't hard code this either

	var elTarget = document.getElementById('sticker_selector');

	if( !elTarget )
		return;
	while( elTarget.firstChild )
		elTarget.removeChild( elTarget.firstChild );

	// Do we have a sticker pack? If so show that first
	if( this.unStickerPacks > 0 )
	{
		var elPack = document.createElement('div');
		elPack.classList.add('sticker_item');
		var elImage = document.createElement('img');
		elImage.src = "https://steamcommunity-a.akamaihd.net/public/images/promo/summer2017/stickers_group.png";

		elPack.addEventListener('click', this.OpenPack.bind(this));

		elPack.appendChild(elImage);
		elTarget.appendChild(elPack);
	}


	for(var key in this.rgStickerDefinitions )
	{


		var stickerDef = this.rgStickerDefinitions[key];


		if( !this.BSceneUnlocked( this.strScene ) && stickerDef.texture != this.strScene )
			continue;

		var elSticker = this.CreateScaledSticker( key, unMaxWidth, unMaxHeight, !this.BOwnsSticker( key ) );



		if( this.BOwnsSticker( key ) )
			elSticker.addEventListener('click', this.AddSticker.bind(this, key ) );

		elTarget.appendChild(elSticker);
	}

}

CStickerManager.prototype.CreateScaledSticker = function( key, unMaxWidth, unMaxHeight, bFaded )
{
	var elImage = document.createElement('div');
	var stickerDef = this.rgStickerDefinitions[key];
	var texture = this.rgStickerTextures[ stickerDef.texture ];


	var elSticker = document.createElement('div');
	elSticker.classList.add('sticker_item');

	elImage.style.width = stickerDef.w + "px";
	elImage.style.height = stickerDef.h + "px";

	if( !bFaded  )
	{
		elImage.style.background = "url('"+texture+"') no-repeat -"+stickerDef.x+"px -"+stickerDef.y+"px";
	} else {
		elImage.style.webkitMask = "url('"+texture+"') no-repeat -"+stickerDef.x+"px -"+stickerDef.y+"px";// no-repeat -"+stickerDef.x+"px -"+stickerDef.y+"px";
		elImage.style.mask = "url('"+texture+"') no-repeat -"+stickerDef.x+"px -"+stickerDef.y+"px";// no-repeat -"+stickerDef.x+"px -"+stickerDef.y+"px";

		elImage.style.backgroundColor = '#9E9E9E';
	}



	var fScale = 1.0;

	if( stickerDef.w > unMaxWidth )
		fScale = unMaxWidth / stickerDef.w;

	if( stickerDef.h > unMaxHeight && unMaxHeight / stickerDef.h < fScale )
		fScale = unMaxHeight / stickerDef.h;


	elImage.style.transform = "scale( "+fScale+", "+fScale+" )";

	elSticker.appendChild( elImage );

	if( this.BOwnsSticker( key ) )
	{
		elSticker.addEventListener ( 'click', this.AddSticker.bind ( this, key ) );
		elSticker.draggable = true;
		elSticker.addEventListener ( 'dragstart', this.DragStart.bind ( this, key ) );
	}

	return elSticker;
}

CStickerManager.prototype.DragStart = function( key, event )
{

	event.dataTransfer.setData("key", key);
	event.dataTransfer.dropEffect = "copy";
	console.log(event);

}
CStickerManager.prototype.PopulateSelectors = function( )
{

	// Scene list
	var elTarget = document.getElementById('scene_selector');
	if( !elTarget )
		return;

	while( elTarget.firstChild )
		elTarget.removeChild( elTarget.firstChild );

	for( var key in this.rgBackgroundTextures )
	{

		var elContainer = document.createElement('div');
		var elImage = document.createElement('img');
		var texture = this.rgBackgroundTextures[ key ];

		elImage.src = texture;
		elContainer.classList.add('item');
		elContainer.id = key + "_select_icon";

		var nSceneId = this.rgSceneToIdMap.indexOf(key);

		elImage.addEventListener('click', this.SetScene.bind(this, nSceneId ) );

		// Text counts
		var rgCounts = this.GetStickerCounts( key );
		var elText = document.createElement('div');
		elText.textContent = "%1$s \u0438\u0437 %2$s \u043d\u0430\u043a\u043b\u0435\u0435\u043a".replace(/%1\$s/,rgCounts[0]).replace(/%2\$s/,rgCounts[1])

		elContainer.appendChild(elImage);
		elContainer.appendChild(elText);


		// New counts
		var nNewStickers = this.rgNewStickersCount[key];
		if( nNewStickers )
		{
			var elNew = document.createElement('div');
			elNew.classList.add('new');
			elNew.textContent = nNewStickers;

			elContainer.appendChild(elNew);
		}

		if( this.rgOwnership.scenes[nSceneId] )
		{
			var elNew = document.createElement('div');
			elNew.classList.add('new');
			elNew.classList.add('unlocked');
			elNew.textContent = '✔';

			elContainer.appendChild(elNew);
		}


		if( nNewStickers )
			elTarget.insertBefore(elContainer, elTarget.firstChild);
		else
			elTarget.appendChild(elContainer);
	}

}

CStickerManager.prototype.GetStickerCounts = function( strScene )
{
	var unStickersTotal = 0;
	var unStickersOwned= 0;

	for( var key in this.rgStickerDefinitions )
	{
		var sticker = this.rgStickerDefinitions[ key ];
		if ( sticker.texture == strScene )
		{
			unStickersTotal++;
			if( this.BOwnsSticker( key ) )
				unStickersOwned++;
		}
	}
	return [ unStickersOwned, unStickersTotal ];
}

CStickerManager.prototype.BOwnsSticker = function( strStickerID )
{

	var nStickerId = this.rgStickerToIdMap.indexOf( strStickerID );
	return this.rgOwnership.stickers[ nStickerId ];
};

CStickerManager.prototype.BSceneUnlocked = function( strScene )
{
	var nSceneId = this.rgSceneToIdMap.indexOf(strScene);
	return this.rgOwnership.scenes[nSceneId];
}

CStickerManager.prototype.BSceneCanBeUnlocked = function( strScene )
{
	var rgSceneData = this.GetSceneData();

	for( var key in this.rgStickerDefinitions )
	{
		var sticker = this.rgStickerDefinitions[ key ];

		if ( sticker.texture == strScene )
		{
			var bFound = false;
			for( var i=0; i<rgSceneData.length; i++ )
			{
				if( rgSceneData[i].id == key )
				{
					bFound = true;
					break;
				}
			}
			if(!bFound)
				return false;
		}
	}
	return true;
}

CStickerManager.prototype.ResetScene = function()
{
	var rgStickers = this.elContainer.getElementsByClassName('sticker');
	for( var i=rgStickers.length - 1; i >= 0; i-- )
	{
		this.elContainer.removeChild( rgStickers[i] );
	}
}

CStickerManager.prototype.GetDefaultScene = function( strScene )
{
	var rgScene = [];

	for( var key in this.rgStickerDefinitions )
	{
		var sticker = this.rgStickerDefinitions[key];
		if( sticker.texture == strScene )
		{
			rgScene.push({
				id: key,
				x: sticker.dx * this.fScaleFactor,
				y: sticker.dy * this.fScaleFactor,
				sx: 1.0,
				sy: 1.0,
				r: 0,
				z: sticker.z
			});
		}
	}

	return rgScene;
}

CStickerManager.prototype.PreloadScene = function()
{
	// pass
}

CStickerManager.prototype.CreateSticker = function(id, x, y, sx, sy, r, z)
{
	var elSticker = document.createElement('div');
	var stickerDef = this.rgStickerDefinitions[id];
	var texture = this.rgStickerTextures[ stickerDef.texture ];

	elSticker.sticker = {
		id: id,
		x: x,
		y: y,
		sx: sx,
		sy: sy,
		r: r,
		z: z
	};

	elSticker.style.width = stickerDef.w + "px";
	elSticker.style.height = stickerDef.h + "px";
	elSticker.style.background = "url('"+texture+"') no-repeat -"+stickerDef.x+"px -"+stickerDef.y+"px";

	this.elContainer.appendChild(elSticker);

	//elSticker.addEventListener('click',  );
	var _this = this;
	elSticker.addEventListener('mousedown', function( event ){
		_this.SetStickerActive( elSticker );
		_this.StickerDragStart('x', 'y', false, event );
	});

	elSticker.addEventListener('touchstart', function( event ){
		_this.SetStickerActive( elSticker );
		_this.StickerDragStart('x', 'y', false, event );
	});

	this.UpdateStickerState( elSticker );

	elSticker.classList.add("sticker");




}

CStickerManager.prototype.UpdateStickerState = function( elSticker )
{
	elSticker.style.transform = "rotate("+elSticker.sticker.r+"deg) scale("+(elSticker.sticker.sx*this.fScaleFactor)+", "+(elSticker.sticker.sy*this.fScaleFactor)+")";

	var rect = elSticker.getBoundingClientRect();

	elSticker.style.left = elSticker.sticker.x+"px";
	elSticker.style.top = elSticker.sticker.y+"px";

	if( elSticker.sticker.z )
		elSticker.style.zIndex = elSticker.sticker.z;


}

CStickerManager.prototype.SetScene = function( nSceneId )
{

	// Save off old scene if we were on one
	if( this.strScene )
	{

		var nOldSceneId = this.rgSceneToIdMap.indexOf( this.strScene );
		this.rgSceneData[nOldSceneId] = this.GetSceneData();
	}

	this.strScene = this.rgSceneToIdMap[ nSceneId ];

	var rgBackgrounds = this.elContainer.getElementsByClassName('sticker_background');
	rgBackgrounds[0].src =this.rgBackgroundTextures[this.strScene];

	this.Render( this.rgSceneData[ nSceneId ] );

	// Update handles
	var rgMatches = document.querySelectorAll('.background_selection_container .item');

	for( var i=0; i < rgMatches.length; i++)
	{
		rgMatches[i].classList.remove('selected');
	}

	var elTarget  = document.getElementById(this.strScene  + "_select_icon");
	if( elTarget )
		elTarget.classList.add('selected');

	this.PopulateStickerList();

	if( this.bEditMode )
	{
		if ( !this.BSceneUnlocked ( this.strScene ) )
		{
			document.getElementById ( 'r_handle' ).style.display = "none";
			document.getElementById ( 's_handle' ).style.display = "none";
			document.getElementById ( 'feature_on_profile' ).style.display = "none";

		}
		else
		{
			document.getElementById ( 'r_handle' ).style.display = "block";
			document.getElementById ( 's_handle' ).style.display = "block";
			document.getElementById ( 'feature_on_profile' ).style.display = "inline-block";
		}
	}

};

CStickerManager.prototype.Render = function( rgSceneData )
{
	this.ResetScene();


	for( var i=0; i<rgSceneData.length; i++)
	{
		var sticker = rgSceneData[i];
		this.CreateSticker( sticker.id, sticker.x, sticker.y, sticker.sx, sticker.sy, sticker.r, sticker.z );
	}

	this.DeactivateSticker();
}

CStickerManager.prototype.MoveDot = function( dot, x, y )
{
	var dot = document.getElementById(dot);
	dot.style.top = y + "px";
	dot.style.left = x + "px";
}


CStickerManager.prototype.SetStickerActive = function( sticker )
{

	this.DeactivateSticker();

	this.elActiveSticker = sticker;
	sticker.classList.add('active');
	var elEditBox = document.getElementById('edit_box');
	elEditBox.classList.add('active');

	this.UpdateStickerHandles();

}

// Deselect any active sticker
CStickerManager.prototype.DeactivateSticker = function( )
{
	// Deactivate other sticker
	if( this.elActiveSticker )
	{
		this.elActiveSticker.classList.remove('active');
		var elEditBox = document.getElementById('edit_box');
		elEditBox.classList.remove('active');
	}
}

CStickerManager.prototype.UpdateStickerHandles = function()
{
	var elEditBox = document.getElementById('edit_box'); // @todo chrisk switch to class of elContainer if we ever need to have two editable boxes on one page

	var rect = this.elActiveSticker.getBoundingClientRect();
	var parentRect = this.elContainer.getBoundingClientRect();


	elEditBox.style.left =  1/this.fLocalScale * ( rect.left -  parentRect.left )  + "px";
	elEditBox.style.top = 1/this.fLocalScale * ( rect.top -  parentRect.top ) + "px";
	elEditBox.style.width = 1/this.fLocalScale * rect.width+ "px";
	elEditBox.style.height = 1/this.fLocalScale * rect.height+ "px";
}


CStickerManager.prototype.ShowEditHandles = function()
{

	document.getElementById('d_handle').addEventListener('mouseup', this.StickerDelete.bind(this ) );
	document.getElementById('s_handle').addEventListener('mousedown', this.StickerDragStart.bind(this, 'sx', 'sy', false ) );
	document.getElementById('r_handle').addEventListener('mousedown', this.StickerDragStart.bind(this, 'r', 'r', false) );

	this.elContainer.addEventListener('mousemove', this.StickerDragMove.bind(this) );
	this.elContainer.addEventListener('mouseup', this.StickerDragStop.bind(this) );

	// phones
	document.getElementById('d_handle').addEventListener('touchend', this.StickerDelete.bind(this  ) );
	document.getElementById('s_handle').addEventListener('touchstart', this.StickerDragStart.bind(this, 'sx', 'sy', false ) );
	document.getElementById('r_handle').addEventListener('touchstart', this.StickerDragStart.bind(this, 'r', 'r', false) );

	this.elContainer.addEventListener('touchmove', this.StickerDragMove.bind(this) );

	this.elContainer.addEventListener('touchend', this.StickerDragStop.bind(this) );
	this.elContainer.addEventListener('touchcancel', this.StickerDragStop.bind(this) );

	this.elContainer.addEventListener('drop', this.StickerDragDrop.bind(this) );
	this.elContainer.addEventListener('dragover', this.StickerDrag.bind(this) );

}

CStickerManager.prototype.StickerDragDrop = function( event )
{
	if( event.dataTransfer.getData('key') )
		this.AddSticker( event.dataTransfer.getData('key') );


}

CStickerManager.prototype.StickerDrag = function( event )
{

	event.preventDefault();
}

CStickerManager.prototype.StickerDelete = function(  )
{
	this.elActiveSticker.parentNode.removeChild(this.elActiveSticker);
	this.DeactivateSticker();
}

CStickerManager.prototype.StickerDragStart = function( propertyX, propertyY, propertyR, event )
{
	event.target.parentNode.classList.add('active');

	this.rgDragState = {
		x: event.screenX || event.touches[0].screenX,
		y: event.screenY || event.touches[0].screenY,
		property_x: propertyX,
		property_y: propertyY,
		property_r: propertyR
	};

	event.preventDefault();
};

CStickerManager.prototype.StickerDragStop = function( )
{
	this.rgDragState = false;
	event.preventDefault();

	var rgElements = document.querySelectorAll('#edit_box > div');

	for( var i=0; i<rgElements.length; i++)
		rgElements[i].classList.remove('active');


}



CStickerManager.prototype.StickerDragMove = function( event )
{
	//console.log(event);
	if ( !this.rgDragState )
		return;

	if( !this.BSceneUnlocked( this.strScene ) )
		return;
	var nTouchX = event.screenX || event.touches[0].screenX;
	var nTouchY = event.screenY || event.touches[0].screenY;

	var nTouchPageX = event.pageX || event.touches[0].pageX;
	var nTouchPageY = event.pageY || event.touches[0].pageY;

	if( this.rgDragState.property_x )
	{
		var xdelta  = nTouchX - this.rgDragState.x;

		if( this.rgDragState.property_x == "sx")
		{

			this.elActiveSticker.sticker.sx += xdelta / this.rgStickerDefinitions[ this.elActiveSticker.sticker.id ].w;

		}
		else
		{
			this.elActiveSticker.sticker[this.rgDragState.property_x] += xdelta;
		}


	}

	if( this.rgDragState.property_y )
	{
		var ydelta  = nTouchY - this.rgDragState.y;

		if( this.rgDragState.property_y == "sy")
		{
			this.elActiveSticker.sticker.sy += ydelta / this.rgStickerDefinitions[ this.elActiveSticker.sticker.id ].h;

		}
		else
			this.elActiveSticker.sticker[this.rgDragState.property_y] += ydelta;

	}

	// Balance sx/sy
	this.elActiveSticker.sticker.sx = this.elActiveSticker.sticker.sy;


	if( this.rgDragState.property_r )
	{


		var rect = this.elActiveSticker.getBoundingClientRect();
		var parentRect = this.elActiveSticker.getBoundingClientRect();

		var x = rect.left - parentRect.left + rect.width / 2;
		var y = rect.top - parentRect.top + rect.height / 2;


		var mousex = nTouchPageX - parentRect.left;
		var mousey = nTouchPageY - parentRect.top ;



		var angle = Math.atan2( mousey - y, mousex - x ) * 180 / Math.PI;


		this.elActiveSticker.sticker[this.rgDragState.property_r] = angle;

	}


	this.rgDragState.x = nTouchX;
	this.rgDragState.y = nTouchY;

	this.UpdateStickerState( this.elActiveSticker );
	this.UpdateStickerHandles();

	event.preventDefault();

}

CStickerManager.prototype.SetOwnedStickers = function( rgOwnership )
{
	this.rgOwnership = rgOwnership;
	this.unStickerPacks = rgOwnership.stickerpacks;



	this.PopulateSelectors();
	this.PopulateStickerList();
};

CStickerManager.prototype.SetSceneData = function( rgStuff )
{
	for ( var i = 0; i < this.rgSceneToIdMap.length; i++ )
	{
		this.rgSceneData[i] = rgStuff[i] || [];
	}

}

CStickerManager.prototype.BSceneHasSticker = function( strStickerId )
{
	var rgData = this.GetSceneData();
	for ( var i=0; i<rgData.length; i++ )
		if( rgData[i].id == strStickerId )
			return true;

	return false;
}


CStickerManager.prototype.GetSceneData = function()
{
	// pass
	var rgScene = [];
	var rgStickers = document.getElementsByClassName('sticker');

	if( rgStickers )
	{

		for ( var i = 0; i < rgStickers.length; i++ )
		{
			rgScene.push ( rgStickers[ i ].sticker );
		}
	}

	return rgScene;
};

CStickerManager.prototype.SaveScene = function( bFeature, bSilent )
{
	var rgRequest = {
		scene_data: this.GetSceneData(),
		sceneid: this.rgSceneToIdMap.indexOf( this.strScene ),
		sessionid: g_sessionID,
		active: bFeature ? 1 : 0
	};

	$J.ajax({
		url: g_strProfileURL + '/stickerssave/',
		data: rgRequest,
		method: 'POST'

	}).done(function() {

		if( !bSilent )
			ShowAlertDialog( "\u0418\u0437\u043c\u0435\u043d\u0435\u043d\u0438\u044f \u0441\u043e\u0445\u0440\u0430\u043d\u0435\u043d\u044b", "\u0418\u0437\u043c\u0435\u043d\u0435\u043d\u0438\u044f \u043d\u0430\u043a\u043b\u0435\u0435\u043a \u0441\u043e\u0445\u0440\u0430\u043d\u0435\u043d\u044b." )

		console.log("SAVED");
	});
};

CStickerManager.prototype.UnlockScene = function(  )
{
	this.SaveScene(false, true);

	var nSceneId = this.rgSceneToIdMap.indexOf(this.strScene);

	var _this = this;

	$J.ajax({
		url: g_strProfileURL + '/stickerscomplete/',
		method: 'POST',
		data: {
			scene: nSceneId
		}


	}).done(function( data )
	{
		if( data.success == 1 )
		{
			ShowAlertDialog( "\u0421\u0442\u0440\u0430\u043d\u0438\u0446\u0430 \u0440\u0430\u0437\u0431\u043b\u043e\u043a\u0438\u0440\u043e\u0432\u0430\u043d\u0430!", "\u0422\u0435\u043f\u0435\u0440\u044c \u0432\u044b \u043c\u043e\u0436\u0435\u0442\u0435 \u0438\u0437\u043c\u0435\u043d\u044f\u0442\u044c \u043f\u043e\u043b\u043e\u0436\u0435\u043d\u0438\u0435 \u0438 \u0440\u0430\u0437\u043c\u0435\u0440 \u043d\u0430\u043a\u043b\u0435\u0435\u043a \u043d\u0430 \u044d\u0442\u043e\u0439 \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u0435, \u0430 \u0442\u0430\u043a\u0436\u0435 \u0432\u044b\u0441\u0442\u0430\u0432\u0438\u0442\u044c \u0435\u0451 \u0432 \u0441\u0432\u043e\u0451\u043c \u043f\u0440\u043e\u0444\u0438\u043b\u0435 \u0438 \u0434\u043e\u0431\u0430\u0432\u0438\u0442\u044c \u0441\u044e\u0434\u0430 \u043d\u0430\u043a\u043b\u0435\u0439\u043a\u0438 \u0441 \u0434\u0440\u0443\u0433\u0438\u0445 \u0441\u0442\u0440\u0430\u043d\u0438\u0446!" );
			_this.rgOwnership.scenes[ nSceneId ] = 1;
			_this.PopulateStickerList();
		}
	});
}


CStickerManager.prototype.OpenPack = function()
{
	var _this = this;

	$J.ajax({
		url: g_strProfileURL + '/stickersopen/',
		method: 'POST'

	}).done(function( data ) {

		if( data && data.success == 1 && data.stickers.length > 0 )
		{
			var elContainer = document.createElement ( 'div' );
			elContainer.classList.add ( 'openpack_container' );

			var elDesc = document.createElement ( 'p' );
			elDesc.textContent = "\u041d\u043e\u0432\u044b\u0445 \u043d\u0430\u043a\u043b\u0435\u0435\u043a \u0432 \u0432\u0430\u0448\u0435\u0439 \u043a\u043e\u043b\u043b\u0435\u043a\u0446\u0438\u0438: %1$s".
			replace ( /%1\$s/, data.stickers.length );

			elContainer.appendChild ( elDesc );


			var elStickerContainer = document.createElement ( 'div' );
			elStickerContainer.classList.add ( 'sticker_container' );


			while ( data.stickers.length )
			{

				var nStickerId = data.stickers.pop ();

				var elSticker = _this.CreateScaledSticker ( _this.rgStickerToIdMap[ nStickerId ], 140, 100, false );
				elStickerContainer.appendChild ( elSticker );
				_this.rgOwnership.stickers[ nStickerId ] = 1;

				var strStickerKey = _this.rgStickerToIdMap[ nStickerId ];
				var rgStickerDef = _this.rgStickerDefinitions[ strStickerKey ];
				var strScene = rgStickerDef.texture;

				if( _this.rgNewStickersCount[strScene] )
					_this.rgNewStickersCount[strScene]++;
				else
					_this.rgNewStickersCount[strScene] = 1;


			}

			elContainer.appendChild ( elStickerContainer );

			// Did we unlock any scenes?
			var strUnlockTexture = false;
			for ( var i = 0; i < data.stickers.length; i++ )
			{
				var stickerDef = _this.rgStickerDefinitions[ _this.rgStickerToIdMap[ i ] ];
				var strScene = stickerDef.texture;
				if ( _this.BSceneUnlocked ( strScene ) )
				{

					strUnlockTexture = _this.rgBackgroundTextures[ strScene ];
				}

			}

			if ( strUnlockTexture )
			{
				var elUnlockContainer = document.createElement ( 'div' );
				elUnlockContainer.classList.add ( 'unlock_container' );

				var elUnlockTitle = document.createElement ( 'h2' );
				elUnlockTitle.textContent = "\u0421\u0442\u0440\u0430\u043d\u0438\u0446\u0430 \u0440\u0430\u0437\u0431\u043b\u043e\u043a\u0438\u0440\u043e\u0432\u0430\u043d\u0430!";

				var elUnlockSceneImg = document.createElement ( 'img' );
				elUnlockSceneImg.src = strUnlockTexture;

				var elUnlockDesc = document.createElement ( 'p' );
				elUnlockDesc.textContent = "\u0422\u0435\u043f\u0435\u0440\u044c \u0432\u044b \u043c\u043e\u0436\u0435\u0442\u0435 \u0438\u0437\u043c\u0435\u043d\u044f\u0442\u044c \u043f\u043e\u043b\u043e\u0436\u0435\u043d\u0438\u0435 \u0438 \u0440\u0430\u0437\u043c\u0435\u0440 \u043d\u0430\u043a\u043b\u0435\u0435\u043a \u043d\u0430 \u044d\u0442\u043e\u0439 \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u0435, \u0430 \u0442\u0430\u043a\u0436\u0435 \u0432\u044b\u0441\u0442\u0430\u0432\u0438\u0442\u044c \u0435\u0451 \u0432 \u0441\u0432\u043e\u0451\u043c \u043f\u0440\u043e\u0444\u0438\u043b\u0435 \u0438 \u0434\u043e\u0431\u0430\u0432\u0438\u0442\u044c \u0441\u044e\u0434\u0430 \u043d\u0430\u043a\u043b\u0435\u0439\u043a\u0438 \u0441 \u0434\u0440\u0443\u0433\u0438\u0445 \u0441\u0442\u0440\u0430\u043d\u0438\u0446!";

				elUnlockContainer.appendChild ( elUnlockSceneImg );
				elUnlockContainer.appendChild ( elUnlockTitle );
				elUnlockContainer.appendChild ( elUnlockDesc );
				elContainer.appendChild ( elUnlockContainer );
			}

			_this.unStickerPacks = data.stickerpacks;

			var Modal = ShowAlertDialog ( "\u0412\u0430\u0448\u0443 \u043a\u043e\u043b\u043b\u0435\u043a\u0446\u0438\u044e \u043f\u043e\u043f\u043e\u043b\u043d\u0438\u043b\u0438 \u043d\u043e\u0432\u044b\u0435 \u043d\u0430\u043a\u043b\u0435\u0439\u043a\u0438!", elContainer );
		}
		_this.PopulateStickerList();
		_this.PopulateSelectors();

		var elTarget  = document.getElementById(_this.strScene  + "_select_icon");
		if( elTarget )
			elTarget.classList.add('selected');




	});
}

// =====================================================================================================================

var CTaskManager = function(){}

CTaskManager.prototype.rgTaskList = [
	//k_ESummerSaleTaskUseDiscoveryQueue = 0;
	{
		name: "\u041f\u0440\u043e\u0439\u0434\u0438\u0442\u0435 \u043f\u043e \u0441\u043f\u0438\u0441\u043a\u0443 \u0440\u0435\u043a\u043e\u043c\u0435\u043d\u0434\u0430\u0446\u0438\u0439",
		desc: "\u041f\u043e\u0441\u0435\u0442\u0438\u0442\u0435 \u0441\u0432\u043e\u0439 <a href=\"https:\/\/store.steampowered.com\/explore\">\u043b\u0438\u0447\u043d\u044b\u0439 \u0441\u043f\u0438\u0441\u043e\u043a \u0440\u0435\u043a\u043e\u043c\u0435\u043d\u0434\u0430\u0446\u0438\u0439<\/a> \u0438 \u043f\u0440\u043e\u0439\u0434\u0438\u0442\u0435 \u043f\u043e \u043d\u0435\u043c\u0443 \u0434\u043e \u043a\u043e\u043d\u0446\u0430. \u0412\u044b \u043c\u043e\u0436\u0435\u0442\u0435 \u0432\u044b\u043f\u043e\u043b\u043d\u044f\u0442\u044c \u044d\u0442\u043e \u0437\u0430\u0434\u0430\u043d\u0438\u0435 \u0440\u0430\u0437 \u0432 \u0434\u0435\u043d\u044c."	},
	//k_ESummerSaleTaskPlayAGame = 1;
	{
		name: "\u0417\u0430\u043f\u0443\u0441\u0442\u0438\u0442\u0435 \u0438\u0433\u0440\u0443 \u0438\u0437 \u0431\u0438\u0431\u043b\u0438\u043e\u0442\u0435\u043a\u0438",
		desc: "\u041f\u0440\u043e\u0441\u0442\u043e \u0437\u0430\u043f\u0443\u0441\u0442\u0438\u0442\u0435 \u043b\u044e\u0431\u0443\u044e \u0438\u0433\u0440\u0443 \u0438\u0437 \u0441\u0432\u043e\u0435\u0439 \u0431\u0438\u0431\u043b\u0438\u043e\u0442\u0435\u043a\u0438: \u0447\u0442\u043e-\u043d\u0438\u0431\u0443\u0434\u044c \u043d\u043e\u0432\u0435\u043d\u044c\u043a\u043e\u0435 \u0438\u043b\u0438 \u0442\u043e, \u0447\u0442\u043e \u0434\u0430\u0432\u043d\u043e \u0445\u043e\u0442\u0435\u043b\u0438 \u043f\u0440\u043e\u0439\u0442\u0438..."	},
	//k_ESummerSaleTaskViewFriendActivity = 2;
	{
		name: "\u041f\u043e\u0441\u0435\u0442\u0438\u0442\u0435 \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u0443 \u0430\u043a\u0442\u0438\u0432\u043d\u043e\u0441\u0442\u0438 \u0434\u0440\u0443\u0437\u0435\u0439",
		desc: "\u041f\u043e\u0441\u043c\u043e\u0442\u0440\u0438\u0442\u0435, \u0447\u0435\u043c \u0437\u0430\u043d\u0438\u043c\u0430\u044e\u0442\u0441\u044f \u0432\u0430\u0448\u0438 \u0434\u0440\u0443\u0437\u044c\u044f \u0432 Steam \u043d\u0430 \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u0435 <a href=\"https:\/\/steamcommunity.com\/my\/home\">\u0438\u0445 \u0430\u043a\u0442\u0438\u0432\u043d\u043e\u0441\u0442\u0438<\/a>."	},
	//k_ESummerSaleTaskAddToWishlist = 3;
	{
		name: "\u041f\u043e\u043f\u043e\u043b\u043d\u0438\u0442\u0435 \u0441\u043f\u0438\u0441\u043e\u043a \u0436\u0435\u043b\u0430\u0435\u043c\u043e\u0433\u043e",
		desc: "\u041d\u0430\u0439\u0434\u0438\u0442\u0435 \u0438\u0433\u0440\u0443, \u043a\u043e\u0442\u043e\u0440\u0430\u044f \u0432\u0430\u0441 \u0437\u0430\u0438\u043d\u0442\u0435\u0440\u0435\u0441\u0443\u0435\u0442, \u0438 \u0434\u043e\u0431\u0430\u0432\u044c\u0442\u0435 \u0435\u0451 \u0432 \u0441\u0432\u043e\u0439 <a href=\"https:\/\/steamcommunity.com\/my\/wishlist\">\u0441\u043f\u0438\u0441\u043e\u043a \u0436\u0435\u043b\u0430\u0435\u043c\u043e\u0433\u043e<\/a>."	},
	//k_ESummerSaleTaskReviewStorePreferences = 4;
	{
		name: "\u041f\u0440\u043e\u0432\u0435\u0440\u044c\u0442\u0435 \u043d\u0430\u0441\u0442\u0440\u043e\u0439\u043a\u0438 \u043c\u0430\u0433\u0430\u0437\u0438\u043d\u0430",
		desc: "\u0412\u044b \u043c\u043e\u0436\u0435\u0442\u0435 \u043f\u043e\u043c\u043e\u0447\u044c \u043c\u0430\u0433\u0430\u0437\u0438\u043d\u0443 Steam \u0432\u044b\u0431\u0438\u0440\u0430\u0442\u044c \u0434\u043b\u044f \u0432\u0430\u0441 \u0441\u0430\u043c\u043e\u0435 \u043b\u0443\u0447\u0448\u0435\u0435, \u0443\u0431\u0435\u0434\u0438\u0432\u0448\u0438\u0441\u044c, \u0447\u0442\u043e <a href=\"https:\/\/store.steampowered.com\/account\/preferences\/\">\u0435\u0433\u043e \u043d\u0430\u0441\u0442\u0440\u043e\u0439\u043a\u0438<\/a> \u043e\u0442\u0432\u0435\u0447\u0430\u044e\u0442 \u0432\u0430\u0448\u0438\u043c \u0438\u043d\u0442\u0435\u0440\u0435\u0441\u0430\u043c."	},
	//k_ESummerSaleTaskEarnAchievement = 5;
	{
		name: "\u0417\u0430\u0440\u0430\u0431\u043e\u0442\u0430\u0439\u0442\u0435 \u0434\u043e\u0441\u0442\u0438\u0436\u0435\u043d\u0438\u0435",
		desc: "\u0417\u0430\u043f\u0443\u0441\u0442\u0438\u0442\u0435 \u043b\u044e\u0431\u0443\u044e \u0438\u0433\u0440\u0443 \u0438\u0437 \u0441\u0432\u043e\u0435\u0439 \u0431\u0438\u0431\u043b\u0438\u043e\u0442\u0435\u043a\u0438 Steam \u0438 \u043f\u043e\u043b\u0443\u0447\u0438\u0442\u0435 \u0432 \u043d\u0435\u0439 \u0434\u043e\u0441\u0442\u0438\u0436\u0435\u043d\u0438\u0435. \u041f\u0440\u043e\u0433\u0440\u0435\u0441\u0441 \u0434\u043e\u0441\u0442\u0438\u0436\u0435\u043d\u0438\u0439 \u0432\u044b \u043c\u043e\u0436\u0435\u0442\u0435 \u043d\u0430\u0439\u0442\u0438 \u043d\u0430 <a href=\"https:\/\/steamcommunity.com\/my\/games\">\u0441\u0442\u0440\u0430\u043d\u0438\u0446\u0435 \u0441\u0432\u043e\u0438\u0445 \u0438\u0433\u0440<\/a>."	},
	//k_ESummerSaleTaskVisitBroadcastPage = 6;
	{
		name: "\u041f\u043e\u0441\u0435\u0442\u0438\u0442\u0435 \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u0443 \u0442\u0440\u0430\u043d\u0441\u043b\u044f\u0446\u0438\u0439",
		desc: "\u0412\u0437\u0433\u043b\u044f\u043d\u0438\u0442\u0435 \u043d\u0430 \u0441\u043f\u0438\u0441\u043e\u043a <a href=\"https:\/\/steamcommunity.com?subsection=broadcasts\">\u0442\u0440\u0430\u043d\u0441\u043b\u044f\u0446\u0438\u0439<\/a>, \u043f\u0440\u043e\u0432\u043e\u0434\u0438\u043c\u044b\u0445 \u0438\u0433\u0440\u043e\u043a\u0430\u043c\u0438."	},
	//k_ESummerSaleTaskMarkReviewHelpful = 7;
	{
		name: "\u041e\u0446\u0435\u043d\u0438\u0442\u0435 (\u0431\u0435\u0441)\u043f\u043e\u043b\u0435\u0437\u043d\u043e\u0441\u0442\u044c \u043e\u0431\u0437\u043e\u0440\u0430",
		desc: "\u041f\u043e\u0432\u043b\u0438\u044f\u043b \u043b\u0438 \u043d\u0430 \u0432\u0430\u0448\u0435 \u0440\u0435\u0448\u0435\u043d\u0438\u0435 \u043e \u043f\u043e\u043a\u0443\u043f\u043a\u0435 \u043f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u0435\u043b\u044c\u0441\u043a\u0438\u0439 \u043e\u0431\u0437\u043e\u0440? \u041e\u0446\u0435\u043d\u0438\u0442\u0435 \u0435\u0433\u043e \u043f\u043e\u043b\u0435\u0437\u043d\u043e\u0441\u0442\u044c \u0438\u043b\u0438 \u043f\u043e\u043c\u0435\u0442\u044c\u0442\u0435 \u0435\u0433\u043e \u043a\u0430\u043a \u0437\u0430\u0431\u0430\u0432\u043d\u044b\u0439."	},
	//k_ESummerSaleTaskFollowCurator = 8;
	{
		name: "\u041f\u043e\u0434\u043f\u0438\u0448\u0438\u0442\u0435\u0441\u044c \u043d\u0430 \u043a\u0443\u0440\u0430\u0442\u043e\u0440\u0430",
		desc: "\u0412\u0437\u0433\u043b\u044f\u043d\u0438\u0442\u0435 \u043d\u0430 \u0441\u043f\u0438\u0441\u043e\u043a <a href=\"https:\/\/store.steampowered.com\/curators\">\u043a\u0443\u0440\u0430\u0442\u043e\u0440\u043e\u0432 Steam<\/a> \u0438 \u043f\u043e\u0434\u043f\u0438\u0448\u0438\u0442\u0435\u0441\u044c \u043d\u0430 \u0442\u043e\u0433\u043e, \u043a\u0442\u043e \u043f\u043e\u043c\u043e\u0436\u0435\u0442 \u0432\u0430\u043c \u043d\u0430\u0439\u0442\u0438 \u043b\u0443\u0447\u0448\u0438\u0435 \u0438\u0433\u0440\u044b \u0432 Steam."	},
	//k_ESummerSaleTaskViewAProfile = 9;
	{
		name: "\u041f\u043e\u0441\u0435\u0442\u0438\u0442\u0435 \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u0443 \u043f\u0440\u043e\u0444\u0438\u043b\u044f",
		desc: "\u0412\u0437\u0433\u043b\u044f\u043d\u0438\u0442\u0435 \u043d\u0430 \u0441\u043e\u0434\u0435\u0440\u0436\u0438\u043c\u043e\u0435 \u043f\u0440\u043e\u0444\u0438\u043b\u044f \u043b\u044e\u0431\u043e\u0433\u043e \u0438\u0437 <a href=\"https:\/\/steamcommunity.com\/my\/friends\">\u0432\u0430\u0448\u0438\u0445 \u0434\u0440\u0443\u0437\u0435\u0439<\/a> \u0432 \u0441\u043e\u043e\u0431\u0449\u0435\u0441\u0442\u0432\u0435 Steam."	},
	//k_ESummerSaleTaskViewATagPage = 10;
	{
		name: "\u041f\u043e\u0441\u0435\u0442\u0438\u0442\u0435 \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u0443 \u043f\u043e\u043f\u0443\u043b\u044f\u0440\u043d\u044b\u0445 \u043c\u0435\u0442\u043e\u043a",
		desc: "\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u0447\u0442\u043e-\u043d\u0438\u0431\u0443\u0434\u044c \u0438\u043d\u0442\u0435\u0440\u0435\u0441\u043d\u043e\u0435 \u0438\u0437 <a href=\"https:\/\/store.steampowered.com\/tag\/browse\">\u0440\u0435\u043a\u043e\u043c\u0435\u043d\u0434\u043e\u0432\u0430\u043d\u043d\u044b\u0445 \u0432\u0430\u043c \u043c\u0435\u0442\u043e\u043a<\/a>. \u041c\u043e\u0436\u0435\u0442, \u0447\u0442\u043e-\u043d\u0438\u0431\u0443\u0434\u044c \u043f\u0440\u0438\u0433\u043b\u044f\u043d\u0435\u0442\u0441\u044f!"	},
	//k_ESummerSaleTaskMarkNotInterested = 11;
	{
		name: "\u041f\u043e\u043c\u0435\u0442\u044c\u0442\u0435 \u0438\u0433\u0440\u0443 \u043a\u0430\u043a \u043d\u0435\u0438\u043d\u0442\u0435\u0440\u0435\u0441\u043d\u0443\u044e",
		desc: "\u0413\u0434\u0435-\u0442\u043e \u0432 \u043c\u0430\u0433\u0430\u0437\u0438\u043d\u0435 \u043d\u0430\u0439\u0434\u0451\u0442\u0441\u044f \u0438\u0433\u0440\u0430, \u043a\u043e\u0442\u043e\u0440\u0430\u044f \u0432\u0430\u043c \u043d\u0435 \u043f\u043e \u0434\u0443\u0448\u0435. \u041d\u0430\u0436\u043c\u0438\u0442\u0435 \u043d\u0430 \u043a\u043d\u043e\u043f\u043a\u0443 \u00ab\u041d\u0435\u0438\u043d\u0442\u0435\u0440\u0435\u0441\u043d\u043e\u00bb \u0438 \u043d\u0435 \u0432\u043e\u043b\u043d\u0443\u0439\u0442\u0435\u0441\u044c \u2014 \u0434\u0440\u0443\u0433\u0438\u0445 \u0438\u0433\u0440 \u044d\u0442\u043e \u043d\u0435 \u043a\u043e\u0441\u043d\u0451\u0442\u0441\u044f."	},
	//k_ESummerSaleTaskViewVideosPage = 12;
	{
		name: "\u041f\u043e\u0441\u0435\u0442\u0438\u0442\u0435 \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u0443 \u0432\u0438\u0434\u0435\u043e \u0432 \u043c\u0430\u0433\u0430\u0437\u0438\u043d\u0435 Steam",
		desc: "\u041f\u043e\u0441\u0435\u0442\u0438\u0442\u0435 <a href=\"https:\/\/store.steampowered.com\/videos\">\u0440\u0430\u0437\u0434\u0435\u043b \u0434\u043b\u044f \u0432\u0438\u0434\u0435\u043e<\/a> \u0432 \u043c\u0430\u0433\u0430\u0437\u0438\u043d\u0435 Steam."	},
	//k_ESummerSaleTaskUploadAScreenshot = 13;
	{
		name: "\u041f\u0435\u0440\u0435\u0439\u0434\u0438\u0442\u0435 \u043a \u0441\u0432\u043e\u0438\u043c \u0441\u043a\u0440\u0438\u043d\u0448\u043e\u0442\u0430\u043c",
		desc: "\u0421\u0434\u0435\u043b\u0430\u0439\u0442\u0435 \u0441\u043a\u0440\u0438\u043d\u0448\u043e\u0442 \u0432 \u0438\u0433\u0440\u0435 (\u043f\u043e \u0443\u043c\u043e\u043b\u0447\u0430\u043d\u0438\u044e \u043a\u043b\u0430\u0432\u0438\u0448\u0435\u0439 F12), \u043e\u043f\u0443\u0431\u043b\u0438\u043a\u0443\u0439\u0442\u0435 \u0435\u0433\u043e \u0432 \u0441\u043e\u043e\u0431\u0449\u0435\u0441\u0442\u0432\u0435 Steam, \u0430 \u0437\u0430\u0442\u0435\u043c <a href=\"https:\/\/steamcommunity.com\/my\/screenshots\">\u043f\u0435\u0440\u0435\u0439\u0434\u0438\u0442\u0435 \u043a \u0441\u0432\u043e\u0438\u043c \u0441\u043a\u0440\u0438\u043d\u0448\u043e\u0442\u0430\u043c<\/a>."	},
	//k_ESummerSaleTaskPersonalizeProfile = 14;
	{
		name: "\u041e\u0442\u0440\u0435\u0434\u0430\u043a\u0442\u0438\u0440\u0443\u0439\u0442\u0435 \u0441\u0432\u043e\u0439 \u043f\u0440\u043e\u0444\u0438\u043b\u044c \u0432 \u0441\u043e\u043e\u0431\u0449\u0435\u0441\u0442\u0432\u0435 Steam",
		desc: "<a href=\"https:\/\/steamcommunity.com\/my\/profile\">\u0421\u0432\u043e\u0439 \u043f\u0440\u043e\u0444\u0438\u043b\u044c<\/a> \u043c\u043e\u0436\u043d\u043e \u0443\u043a\u0440\u0430\u0441\u0438\u0442\u044c \u043c\u043d\u043e\u0436\u0435\u0441\u0442\u0432\u043e\u043c \u0441\u043f\u043e\u0441\u043e\u0431\u043e\u0432 \u2014 \u043d\u0430\u0436\u043c\u0438\u0442\u0435 \u043d\u0430 \u043c\u0430\u043d\u044f\u0449\u0443\u044e \u043a\u043d\u043e\u043f\u043a\u0443 \u00ab\u0420\u0435\u0434\u0430\u043a\u0442\u0438\u0440\u043e\u0432\u0430\u0442\u044c \u043f\u0440\u043e\u0444\u0438\u043b\u044c\u00bb \u0438 \u0441\u043c\u0435\u043b\u043e \u043f\u0440\u0438\u0441\u0442\u0443\u043f\u0430\u0439\u0442\u0435!"	},
	//k_ESummerSaleTaskPersonalizeDiscoveryQueue = 15;
	{
		name: "\u041d\u0430\u0441\u0442\u0440\u043e\u0439\u0442\u0435 \u0441\u043f\u0438\u0441\u043e\u043a \u0440\u0435\u043a\u043e\u043c\u0435\u043d\u0434\u0430\u0446\u0438\u0439",
		desc: "\u0423\u0431\u0435\u0434\u0438\u0442\u0435\u0441\u044c, \u0447\u0442\u043e <a href=\"https:\/\/store.steampowered.com\/account\/preferences?discoveryqueue=1\">\u043d\u0430\u0441\u0442\u0440\u043e\u0438\u043b\u0438 \u0441\u043f\u0438\u0441\u043e\u043a \u0440\u0435\u043a\u043e\u043c\u0435\u043d\u0434\u0430\u0446\u0438\u0439<\/a> \u043f\u043e\u0434 \u0441\u0435\u0431\u044f, \u0447\u0442\u043e\u0431\u044b \u043e\u043d \u0441\u043e\u0432\u043f\u0430\u0434\u0430\u043b \u0441 \u0442\u0435\u043c, \u0447\u0442\u043e \u0432\u044b \u0445\u043e\u0442\u0438\u0442\u0435 \u0432\u0438\u0434\u0435\u0442\u044c \u0432 Steam."	},
];

CTaskManager.prototype.RenderTaskList = function( rgProgress )
{
	// First pass, find tasks we need to do still

	var elTaskContainer = document.getElementById('tasks_remaining_container');
	var elTaskCompleteContainer = document.getElementById('tasks_completed_container');

	var rgTaskIdsShown = {};

	var nTasksToDo = 0;

	for( var i in rgProgress.tasks_remaining )
	{
		if( rgProgress.tasks_remaining[i] > 0 )
		{
			var rgTaskInfo = this.rgTaskList[i];
			rgTaskIdsShown[ i ] = 1;

			//if( !rgTaskInfo ) // ???
			//	continue;

			var elTask = document.createElement('div');
			elTask.classList.add('task');

			var elTaskName = document.createElement('h2');
			elTaskName.innerHTML = rgTaskInfo.name;

			var elTaskDesc = document.createElement('p');
			elTaskDesc.innerHTML = rgTaskInfo.desc;

			elTask.appendChild( elTaskName );
			elTask.appendChild( elTaskDesc );

			elTaskContainer.appendChild( elTask );

			nTasksToDo++;

		}
	}

	if( nTasksToDo == 0 )
	{
		var elT = document.getElementById('tasks_none');
		if( elT )
			elT.style.display = 'inline';
	} else if( nTasksToDo == 1 )
	{
		var elT = document.getElementById('tasks_one');
		if( elT )
			elT.style.display = 'inline';
	} else
	{
		var elT = document.getElementById('tasks_many');
		if( elT )
		{
			elT.style.display = 'inline';
			var elTC = document.getElementById('task_count');
			elTC.textContent = nTasksToDo;
		}
	}

	for(var i in rgProgress.tasks_limits )
	{
		if( rgProgress.tasks_limits[i] > 0 && !rgTaskIdsShown[i] )
		{
			var rgTaskInfo = this.rgTaskList[i];

			if( !rgTaskInfo ) // ???
				continue;

			var elTask = document.createElement('div');
			elTask.classList.add('task');

			elTask.innerHTML = '✔ ' + rgTaskInfo.name;



			elTaskCompleteContainer.appendChild( elTask );

		}
	}
}

