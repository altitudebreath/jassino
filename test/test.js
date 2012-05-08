function dump(data, typ) {
    var s = QUnit.jsDump.parse(data, typ ? typ : typeof data)
	return s.replace(/[\&<>]/g, function(s) {
		switch(s) {
			case "&": return "&amp;";
			case "<": return "&lt;";
			case ">": return "&gt;";
			default: return s;
		}
	});
}

var Class = Jassino.Class,
    Trait = Jassino.Trait,
    ns = Jassino.NS,
    default_up_down = {
        setup: function() {
            ns = Jassino.NS = {}
        },
        teardown: function() {
            ns = Jassino.NS = {}
        }
    }

var eq = equal, ste = strictEqual, rs = raises;

//========================================================================================================================
module("Basic definitions", default_up_down)

test("Class and Trait definitions, typeof Class/Trait === function", 2, function() {
            ste(typeof Class, "function", 'Class')
            ste(typeof Trait, "function", 'Trait')
});

//========================================================================================================================
module("Class/Trait creation, NameSpaces --", default_up_down);

test("Class/Trait creation - default namespace", 2, function() {
    var A = Class('A', {})
    var T = Trait('T', {})
    ste(A, ns.A, 'for Class')
    ste(T, ns.T, 'for Trait')
});

test("Class/Trait creation -> ns(ns)", 2, function() {
    var n = {}
    var A = Class(n, 'A', {})
    var T = Trait(n, 'T', {})
    ste(A, n.A, 'for Class')
    ste(T, n.T, 'for Trait')
});

test("Duplicate Class/Trait creation)", 2, function() {
    var n = {}
    Class(n, 'A', {})
    rs(function(){Class(n, 'A', {})}, Jassino.DuplicationError, 'for Class: ' + dump(n))
    Trait(n, 'T', {})
    rs(function(){Trait(n, 'T', {})}, Jassino.DuplicationError, 'for Trait')
});

test("Duplicate Class/Trait creation - default NS)", 2, function() {
    Class('A', {})
    rs(function(){Class('A', {})}, Jassino.DuplicationError, 'for Class: ' + dump(ns))
    Trait('T', {})
    rs(function(){Trait('T', {})}, Jassino.DuplicationError, 'for Trait')
});

test("Invalid namespace object test on Class/Trait creation)", function() {
    rs(function(){Class(null, 'A', {})}, Jassino.ArgumentsError, 'null ns for Class')
    rs(function(){Trait(null, 'T', {})}, Jassino.ArgumentsError, 'null ns for Trait')
    rs(function(){Class("", {})}, Jassino.ArgumentsError, 'empty name for Class')
    rs(function(){Trait("", {})}, Jassino.ArgumentsError, 'empty for Trait')
    rs(function(){Class("ff")}, Jassino.ArgumentsError, 'empty name for Class')
    rs(function(){Trait("ff")}, Jassino.ArgumentsError, 'empty for Trait')
    rs(function(){Class()}, Jassino.ArgumentsError, 'empty name for Class')
    rs(function(){Trait()}, Jassino.ArgumentsError, 'empty for Trait')
    rs(function(){Class(['a'], {})})
    rs(function(){Trait(['a'], {})})
    Trait('T', {})
    rs(function(){Class(ns, [ns.T], {})})
    rs(function(){Trait(ns, ['a'], {})})
});

//========================================================================================================================
module("Basic Trait operations", default_up_down);

test("Members setup", 1, function() {
    Trait('T', {
        a: 5,
        f: function(){return this.a}
    })
	eq(ns.T.f(), 5, 'member call')
});

//========================================================================================================================
module("Trait inheritance", default_up_down);


test("Single inheritance", 15, function() {
    Trait('A', {
        a: 'a',
        ov: 'ov',
        af: function(){return [this.a, this.ov]},
        ovf: function(){ return [this.a, this.ov];}
    })
    
    Trait('T', [ns.A], {
        t: 'T',
        ov: 'T_ov',
        tf: function(){return [this.t, this.ov, this.a];},
        ovf: function(){ return [this.t, this.ov, this.a];}
    })
    eq(ns.A.af()[0], 'a', 'A.af() - ancestor\'s members do not corrupted')
    eq(ns.A.af()[1], 'ov', 'A.af() - ancestor\'s members do not corrupted 2')
    eq(ns.A.ovf()[0], 'a', 'A.ovf() - ancestor\'s members do not corrupted')
    eq(ns.A.ovf()[1], 'ov', 'A.ovf() - ancestor\'s members do not corrupted 2')

    eq(ns.T.t, 'T', 't = "T" - own members not corrupted')
    eq(ns.T.ov, 'T_ov', 't = "T" - own overriden members are correct')

    eq(ns.T.a, 'a', 'T.a = "a" - inherited variable')

    eq(ns.T.tf()[0], 'T', 'Own T.tf(), should correctly access ancestor/overriden fields')
    eq(ns.T.tf()[1], 'T_ov', 'Own T.tf(), should correctly access ancestor/overriden fields 2')
    eq(ns.T.tf()[2], 'a', 'Own T.tf(), should correctly access ancestor/overriden fields 3')

    eq(ns.T.af()[0], 'a' , 'Virtual function effect: Inherited A.af() -> T.af(), overriden variables should be changed')
    eq(ns.T.af()[1], 'T_ov' , 'Virtual function effect: Inherited A.af() -> T.af(), overriden variables should be changed 2')

    eq(ns.T.ovf()[0], 'T', 'Overriden A.ovf() -> T.ovf() - output should be as in T.tf()')
    eq(ns.T.ovf()[1], 'T_ov', 'Overriden A.ovf() -> T.ovf() - output should be as in T.tf() 2')
    eq(ns.T.ovf()[2], 'a', 'Overriden A.ovf() -> T.ovf() - output should be as in T.tf() 3')
});


//-------------------------------------------------------------------------------------------------------------------
test("Multiple inheritance", 6, function() {
    Trait('A', {
        a: 'a',
        ovf: function(){return 'A'},
        anc_ovf: function(){ return 'anc_A';},
        anc_ovf2: function(){ return 'anc_A_2';}
    })
    Trait('B', {
        b: 'b',
        ovf: function(){return 'B'},
        anc_ovf: function(){ return 'anc_B';},
        anc_ovf2: function(){ return 'anc_B_2';}
    })
    Trait('C', {
        c: 'c',
        anc_ovf: function(){ return 'anc_C';}
    })
    Trait('T', [ns.A, ns.B, ns.C], {
        ovf: function(){ return 'T';}
    })
    eq(ns.T.a, 'a', 'inherited variable')
    eq(ns.T.b, 'b', 'inherited variable 2')
    eq(ns.T.c, 'c', 'inherited variable 3')

    eq(ns.T.ovf(), 'T', 'Overriden ovf() -> T.ovf()')
    eq(ns.T.anc_ovf(), 'anc_C', 'Inheritance order: override 1 - last override in C')
    eq(ns.T.anc_ovf2(), 'anc_B_2', 'Inheritance order: override 2 - last override in B')
});
//========================================================================================================================
test("Inheritance transitive law", 4, function() {
    Trait('A', {
        a: 'a',
        ovf: function(){return 'A'},
        anc_ovf: function(){ return 'anc_A';}
    })
    Trait('B', [ns.A], {
        b: 'b',
        ovf: function(){return 'B'},
        anc_ovf: function(){ return 'anc_B';}
    })
    Trait('T', [ns.B], {
        ovf: function(){ return 'T';}
    })
    eq(ns.T.a, 'a', 'inherited variable')
    eq(ns.T.b, 'b', 'inherited variable 2')

    eq(ns.T.ovf(), 'T', 'Overriden ovf() -> T.ovf()')
    eq(ns.T.anc_ovf(), 'anc_B', 'Inheritance override stack: last override happened in B')
});
//========================================================================================================================
//================================================== Classes =============================================================
//========================================================================================================================
//========================================================================================================================
module("Basic Class definitions and operations", default_up_down);

//-------------------------------------------------------------------------------------------------------------------
test("Object members should not become class members", 2, function() {
    Class('T', {
        a: 5,
        f: function(){return this.a}
    })
    
    ste(ns.T.f, undefined)
    ste(ns.T.a, undefined)

});

//-------------------------------------------------------------------------------------------------------------------
test("Simple instantiation with implicit constructor", 1, function() {
    Class('T', {
        a: 5,
        f: function(){return this.a}
    })
	var t = new ns.T()
    
    eq(t.f(), 5, 'member call')
});

//========================================================================================================================
module("Class constructors", default_up_down);

//-------------------------------------------------------------------------------------------------------------------
test("Explicit constructor", 1, function() {
    Class('T', {
        _: function(num){this.num = num},
        a: "zz",
        f: function(){return this.a + this.num}
    })

    var t = new ns.T("xx")

    ste(t.f(), "zzxx", 'member call test')
});

//-------------------------------------------------------------------------------------------------------------------
test("Implicit constructor", 1, function() {
    Class('A', {
        _:function(ancestor_name){
            this.a = "ancestor"
            this.b = ancestor_name
        }
    })
    
    Class('T', ns.A, {
        res: function(){return this.a + " " + this.b}
    })

    var t = new ns.T("Sam", "Guy")

    ste(t.res(), "ancestor Sam", 'work properly with super classes, ignores extra parameters')
});


//-------------------------------------------------------------------------------------------------------------------
test("Explicit shortcut - no SuperClass", 3, function() {
    
    Class('T', {
        _: ['country', 'flag_color']
    })

    var t = new ns.T("China", "Red")
 
    ok(true, dump(t))
    ste(t.country, "China", 'initializes parameter')
    ste(t.flag_color, "Red", 'initializes parameter')
});


//-------------------------------------------------------------------------------------------------------------------
test("Explicit shortcut with super args but no SuperClass (Error)", 1, function() {
    rs(function(){
        Class('T', {
            _: [[], ['country', 'flag_color']]
        })
        },
        Jassino.ConstructorError,
        "not allowed"
    )
});

//-------------------------------------------------------------------------------------------------------------------
test("Explicit shortcut constructor with super classes", 1, function() {
    
    Class('A', {
        _:function(ancestor_name){
            this.a = "ancestor"
            this.a1 = ancestor_name
        }
    })

    Class('B', ns.A, {
        _: [['ancestor NAME'], ['b']]    //first array is only for readability, only its size is used 
    })
    
    Class('T', ns.B, {
        _:[['anc', 'b'], ['c']],
        res: function(){return this.a + " " + this.a1 + " " + this.b + " " + this.c}
    })

    var t = new ns.T("Sam", "b", "c")

    ste(t.res(), "ancestor Sam b c", 'work properly with super classes, ignores extra parameters')
});


//========================================================================================================================
module("Classes mixed-in with Traits", default_up_down);

test("Single mixin", 1, function() {
    Trait('T1', {t1: "a"})

    Class('C1', [ns.T1], {
        a: "CLS",
        f: function(){return this.a + this.t1}
    })

    ste((new ns.C1()).f(), "CLSa")

});

//-------------------------------------------------------------------------------------------------------------------
test("Multiple mixins", 2, function() {
    
    Trait('T1', {t1: "a", xf: function(){return "1"}})
    Trait('T2', {t2: "b"})
    Trait('T3', [ns.T2], {t3: function(){return this.t2 + "c"}})

    Class('C', [ns.T1, ns.T2, ns.T3], {
        a: "CLS",
        xf: function(){return "2"},
        f: function(){return this.a + this.t1 + this.t3()}
    })

    var inst = new ns.C()
    ste(inst.f(), "CLSabc", "accessing members")
    ste(inst.xf(), "2", "overriding trait members")

});

//========================================================================================================================
module("Class inheritance", default_up_down);

//-------------------------------------------------------------------------------------------------------------------
test("Inheritance: members test", 15, function() {
    Class('A', {
        a: 'a',
        ov: 'ov',
        af: function(){return [this.a, this.ov]},
        ovf: function(){ return [this.a, this.ov];}
    })
    
    Class('T', ns.A, {
        t: 'T',
        ov: 'T_ov',
        tf: function(){return [this.t, this.ov, this.a];},
        ovf: function(){ return [this.t, this.ov, this.a];}
    })
    var a = new ns.A(), t = new ns.T()
    
    ste(a.af()[0], 'a', 'A.af() - ancestor\'s members do not corrupted')
    ste(a.af()[1], 'ov', 'A.af() - ancestor\'s members do not corrupted 2')
    ste(a.ovf()[0], 'a', 'A.ovf() - ancestor\'s members do not corrupted')
    ste(a.ovf()[1], 'ov', 'A.ovf() - ancestor\'s members do not corrupted 2')

    ste(t.t, 'T', 't = "T" - own members not corrupted')
    ste(t.ov, 'T_ov', 't = "T" - own overriden members are correct')

    ste(t.a, 'a', 'T.a = "a" - inherited variable')

    ste(t.tf()[0], 'T', 'Own T.tf(), should correctly access ancestor/overriden fields')
    ste(t.tf()[1], 'T_ov', 'Own T.tf(), should correctly access ancestor/overriden fields 2')
    ste(t.tf()[2], 'a', 'Own T.tf(), should correctly access ancestor/overriden fields 3')

    ste(t.af()[0], 'a' , 'Virtual function effect: Inherited A.af() -> T.af(), overriden variables should be changed')
    ste(t.af()[1], 'T_ov' , 'Virtual function effect: Inherited A.af() -> T.af(), overriden variables should be changed 2')

    ste(t.ovf()[0], 'T', 'Overriden A.ovf() -> T.ovf() - output should be as in T.tf()')
    ste(t.ovf()[1], 'T_ov', 'Overriden A.ovf() -> T.ovf() - output should be as in T.tf() 2')
    ste(t.ovf()[2], 'a', 'Overriden A.ovf() -> T.ovf() - output should be as in T.tf() 3')
});

//-------------------------------------------------------------------------------------------------------------------
test("Inheritance from usual Prototype-Based pseudo class)", 12, function() {
    function A(constr_var){
        this.constr_var = constr_var
    }
    A.prototype.a = 'a'
    A.prototype.ov = 'ov'
    A.prototype.af = function(){return [this.a, this.ov]}
    A.prototype.ovf = function(){ return [this.a, this.ov];}

    Class('T', A, {
        $N: 'A',  //OBLIGATE parameter for natively constructed superclasses !!!
        _:[['constr_var'],[]],
        t: 'T',
        ov: 'T_ov',
        tf: function(){return [this.t, this.ov, this.a];},
        ovf: function(){ return [this.t, this.ov, this.a];}
    })
    var t = new ns.T('CONSTRUCTION')

    ste(t.constr_var, 'CONSTRUCTION', 't = super constructor works')

    ste(t.t, 'T', 't = "T" - own members not corrupted')
    ste(t.ov, 'T_ov', 't = "T" - own overridden members are correct')

    ste(t.a, 'a', 'T.a = "a" - inherited variable')

    ste(t.tf()[0], 'T', 'Own T.tf(), should correctly access ancestor/overriden fields')
    ste(t.tf()[1], 'T_ov', 'Own T.tf(), should correctly access ancestor/overriden fields 2')
    ste(t.tf()[2], 'a', 'Own T.tf(), should correctly access ancestor/overriden fields 3')

    ste(t.af()[0], 'a' , 'Virtual function effect: Inherited A.af() -> T.af(), overriden variables should be changed')
    ste(t.af()[1], 'T_ov' , 'Virtual function effect: Inherited A.af() -> T.af(), overriden variables should be changed 2')

    ste(t.ovf()[0], 'T', 'Overridden A.ovf() -> T.ovf() - output should be as in T.tf()')
    ste(t.ovf()[1], 'T_ov', 'Overridden A.ovf() -> T.ovf() - output should be as in T.tf() 2')
    ste(t.ovf()[2], 'a', 'Overridden A.ovf() -> T.ovf() - output should be as in T.tf() 3')
})

//-------------------------------------------------------------------------------------------------------------------
test("Inheritance transitive law", 4, function() {
    Class('A', {
        a: 'a',
        ovf: function(){return 'A'},
        anc_ovf: function(){ return 'anc_A';}
    })
    
    Class('B', ns.A, {
        b: 'b',
        ovf: function(){return 'B'},
        anc_ovf: function(){ return 'anc_B';}
    })
    Class('T', ns.B, {
        ovf: function(){ return 'T';}
    })
    
    var t = new ns.T()
    
    eq(t.a, 'a', 'inherited variable')
    eq(t.b, 'b', 'inherited variable 2')

    eq(t.ovf(), 'T', 'Overriden ovf() -> T.ovf()')
    eq(t.anc_ovf(), 'anc_B', 'Inheritance override stack: last override happened in B')
});

//-------------------------------------------------------------------------------------------------------------------
test("Rewritten example from my-class (http://myjs.fr/my-class/) - NO INFINITE RECURSION!", 1, function() {
    var N = Jassino.NS
    
    Class('Person', {
        old_method: function(){ return "Hey!, "},
        _: function(name){this.name=name}  //constructor
    })

    Class('Dreamer', N.Person, {
        _:[['name'], ['dream']]  //constructor shortcut: name -> super call, dream -> this.dream
    })

    var custom_ns = {}
    Class(custom_ns, 'Nightmarer', N.Dreamer, {
        field: "dreams about",  //another way to specify instance members 
        
        old_method: function(){ return "Okay, "}, //overriding
        
        _:function(name, dream){
            this.Dreamer(name, dream)
            this.field = this.field.toUpperCase() //control flow should be reached and field created
        },
        test: function(){ return this.Dreamer$.old_method() + 
                                 this.old_method() +
                                 this.name + " " + this.field + " " + this.dream}

    })

    var nm = new custom_ns.Nightmarer("Lissa", "Pie")
    
    ste(nm.test(), "Hey!, Okay, Lissa DREAMS ABOUT Pie", "test to not go into infinite recursion!")
})

//-------------------------------------------------------------------------------------------------------------------
test("DEEP inheritance", 1, function() {
    var LEVEL = 100
    var nspace = {}
    
    Class(nspace, 'C0', {
        get_accum: function(){ return this.accum },
        _: function(i){
            this.accum += "{C0: {}}"
        }  //constructor
    })
    var self, i;
    for (i=1; i < LEVEL; i++){
        self = 'C' + i.toString()
        var ancestor = 'C' + (i - 1).toString()
        
        Class(nspace, self, nspace[ancestor], {
            _: function(i){
                this.accum = '{C' + i.toString() + ": " + (this.accum || "")
                this['C' + (i - 1).toString()](i - 1)
                this.accum += "}"
            }  //constructor
        })
    }
    var accum = (new nspace[self](i - 1)).get_accum()
    ste( accum.replace(/[\w{}\s]+/g, "").length, i, "Here is chain: " + dump(accum))
})
//========================================================================================================================
module("COMPLEX EXAMPLE 1", default_up_down);

test("Bee Colony Simplified", 0, function() {
    /***************************************************************************************
     * Full featured Example
     *************************************************************************************/

    var Class = Jassino.Class, 
        Trait = Jassino.Trait,
        NS = Jassino.NS

    //all parameters in namespaces are totally custom, and have no meaning for Jassino logic
    //just an example how it can be used
    var Insects = {   
        namespace_name: 'Insects',
        moto: "We fly and work!"
    }

    Trait(Insects, 'Fly', {     //explicit namespace
        location: null,         //variables can also be mixed from traits
        fly_to: function(location)
                {this.location = location}
    })

    Trait('Work', {          //this will go to default namespace - Jassino.NS
        work_on: function(place){return "Working on " + place.toString()}
    })

    Class('BeeColony', {
        _: function(bees){this.bees=bees}    //Full form of constructor
    })

    function Bee(gender){             //native pseudo class         
        this.gender = gender
    }

    Class(Insects, 'Queen', Bee, {      
       $N: 'Bee',                  //inheriting from native pseudo class requires explicit name spec
        _: function(name){         //Full form of constructor
            this.Bee('F')          //super constructor call
            this.name=name
        }  //constructor
    })
    
    Class('Worker', Bee, [NS.Work, Insects.Fly], {
        $N: 'Bee',
        //Sort Constructor form form. 
        // This means: 
        // On declaration time, generate constructor accepting 2 parameters,
        // first parameter pass to super constructor
        // second parameter write to this.name 
        _: [['gender'], ['name']]
    })
    //----------------------------------------------------------------------------------------------
    var Plants = {
        namespace_name: 'Plants',
        moto: "We're growing!"
    }


})





