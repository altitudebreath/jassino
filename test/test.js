var ns = {},
    dump = function(data){ return QUnit.jsDump.parse(data)}, //wrapper needed for proper 'this' for jsDump obj
    Class = jassino.Class,
    Trait = jassino.Trait;

//========================================================================================================================
module("Basic definitions")

test("Class and Trait definitions, typeof Class/Trait === function",
        2, //number of asserts those should be executed
        function() {
            strictEqual(typeof Class, "function", 'Class')
            strictEqual(typeof Trait, "function", 'Trait')
        }
);

//========================================================================================================================
module("Class/Trait creation, NameSpaces --", {
    setup: function() {
        ns = {}
        jassino.NS = {}
    },
    teardown: function() {
    }
});

test("Class/Trait creation - default namespace", 2, function() {
    var A = Class('A', {})
    var T = Trait('T', {})
    strictEqual(A, jassino.NS.A, 'for Class')
    strictEqual(T, jassino.NS.T, 'for Trait')
});

test("Class/Trait creation -> ns(ns)", 2, function() {
    var A = Class(ns, 'A', {})
    var T = Trait(ns, 'T', {})
    strictEqual(A, ns.A, 'for Class')
    strictEqual(T, ns.T, 'for Trait')
});

test("Duplicate Class/Trait creation)", 2, function() {
    Class(ns, 'A', {})
    raises(function(){Class(ns, 'A', {})}, jassino.DuplicationError, 'for Class: ' + dump(ns))
    Trait(ns, 'T', {})
    raises(function(){Trait(ns, 'T', {})}, jassino.DuplicationError, 'for Trait')
});

test("Duplicate Class/Trait creation - default NS)", 2, function() {
    Class('A', {})
    raises(function(){Class('A', {})}, jassino.DuplicationError, 'for Class: ' + dump(ns))
    Trait('T', {})
    raises(function(){Trait('T', {})}, jassino.DuplicationError, 'for Trait')
});

test("Invalid namespace object test on Class/Trait creation)", 2, function() {
    raises(function(){Class(null, 'A', {})}, jassino.InvalidNamespaceError, 'for Class')
    raises(function(){Trait(null, 'T', {})}, jassino.InvalidNamespaceError, 'for Trait')
});

//========================================================================================================================
module("Basic Trait operations", {
    setup: function() {
        ns = {}
    },
    teardown: function() {
    }
});

test("Members setup", 1, function() {
    Trait(ns, 'T', {
        a: 5,
        f: function(){return this.a}
    })
	equal(ns.T.f(), 5, 'member call')
});

//========================================================================================================================
module("Trait inheritance", {
    setup: function() {
        ns = {}
    },
    teardown: function() {
        ns = {}
    }
});


test("Single inheritance", 15, function() {
    Trait(ns, 'A', {
        a: 'a',
        ov: 'ov',
        af: function(){return [this.a, this.ov]},
        ovf: function(){ return [this.a, this.ov];}
    })
    Trait(ns, 'T', ns.A, {
        t: 'T',
        ov: 'T_ov',
        tf: function(){return [this.t, this.ov, this.a];},
        ovf: function(){ return [this.t, this.ov, this.a];}
    })
    equal(ns.A.af()[0], 'a', 'A.af() - ancestor\'s members do not corrupted')
    equal(ns.A.af()[1], 'ov', 'A.af() - ancestor\'s members do not corrupted 2')
    equal(ns.A.ovf()[0], 'a', 'A.ovf() - ancestor\'s members do not corrupted')
    equal(ns.A.ovf()[1], 'ov', 'A.ovf() - ancestor\'s members do not corrupted 2')

    equal(ns.T.t, 'T', 't = "T" - own members not corrupted')
    equal(ns.T.ov, 'T_ov', 't = "T" - own overriden members are correct')

    equal(ns.T.a, 'a', 'T.a = "a" - inherited variable')

    equal(ns.T.tf()[0], 'T', 'Own T.tf(), should correctly access ancestor/overriden fields')
    equal(ns.T.tf()[1], 'T_ov', 'Own T.tf(), should correctly access ancestor/overriden fields 2')
    equal(ns.T.tf()[2], 'a', 'Own T.tf(), should correctly access ancestor/overriden fields 3')

    equal(ns.T.af()[0], 'a' , 'Virtual function effect: Inherited A.af() -> T.af(), overriden variables should be changed')
    equal(ns.T.af()[1], 'T_ov' , 'Virtual function effect: Inherited A.af() -> T.af(), overriden variables should be changed 2')

    equal(ns.T.ovf()[0], 'T', 'Overriden A.ovf() -> T.ovf() - output should be as in T.tf()')
    equal(ns.T.ovf()[1], 'T_ov', 'Overriden A.ovf() -> T.ovf() - output should be as in T.tf() 2')
    equal(ns.T.ovf()[2], 'a', 'Overriden A.ovf() -> T.ovf() - output should be as in T.tf() 3')
});


test("Multiple inheritance", 6, function() {
    Trait(ns, 'A', {
        a: 'a',
        ovf: function(){return 'A'},
        trait_ovf: function(){ return 'trait_A';},
        trait_ovf2: function(){ return 'trait_A_2';}
    })
    Trait(ns, 'B', {
        b: 'b',
        ovf: function(){return 'B'},
        trait_ovf: function(){ return 'trait_B';},
        trait_ovf2: function(){ return 'trait_B_2';}
    })
    Trait(ns, 'C', {
        c: 'c',
        trait_ovf: function(){ return 'trait_C';}
    })
    Trait(ns, 'T', [ns.A, ns.B, ns.C], {
        ovf: function(){ return 'T';}
    })
    equal(ns.T.a, 'a', 'inherited variable')
    equal(ns.T.b, 'b', 'inherited variable 2')
    equal(ns.T.c, 'c', 'inherited variable 3')

    equal(ns.T.ovf(), 'T', 'Overriden ovf() -> T.ovf()')
    equal(ns.T.trait_ovf(), 'trait_C', 'Inheritance order: override 1 - last override in C')
    equal(ns.T.trait_ovf2(), 'trait_B_2', 'Inheritance order: override 2 - last override in B')
});
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================






