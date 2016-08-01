function ui () {
    this.dancer_curr = null;
}


ui.prototype.dancer_sel = function(dancer){
    this.dacner_curr = dancer;
    this.seq_setroot(dancer.seq);
}

ui.prototype.seq_setroot = function(sequence){
    this.seq_curr = sequence;
    ///update sidebar
    //cleanup
    elem = document.getElementById('sequence');
    while(elem.firstChild)
        elem.removeChild(elem.firstChild);
    //add recursive
    this._addseq(elem, sequence);
}

ui.prototype._addseq = function(list, seq){
    var li = document.createElement("li");
    list.appendChild(li);
    var txt = document.createElement("span");
    txt.textContent = "sequence";
    li.appendChild(txt);
    if(seq.subs.length > 0){
        var ul = document.createElement("ul");
        li.appendChild(ul);
        for(var i = 0; i < seq.subs.length; i++)
            this._addseq(ul, seq.subs[i].seq);
    }
}
