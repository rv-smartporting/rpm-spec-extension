# Demo spec
Name: Test Package
Version: 0.1
Release: 1

%global DATE 20230413
%global gitrev c66b9ee42a4ecd9d14f9724bf0a26019326edf0a
%global gccversion 12.1.1

%global _annotated_build 1
# If statement
%if 0%{?fedora} > 27 || 0%{?rhel} > 7
    # Definition-Reference
    %undefine _annotated_build
%endif

# Ternary operator
%if 0%{?__archive:1}
    %global __archive %{__archive} || :
%endif

# Ifarch/Ifnarch Completion
%ifarch %{riscv32} %{ix86} x86_64 ia64 %{arm} aarch64 riscv64
    %global build_ada 1
%endif
%ifnarch riscv64
    %global build_ada 0
%endif

# Definition-Reference
Source0: gcc-%{gccversion}-%{DATE}.tar.xz
%if %{build_ada}
    # Ada requires Ada to build
    BuildRequires: gcc-gnat >= %{gccversion}, libgnat >= 3.1
%endif